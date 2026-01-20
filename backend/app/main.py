import io
import json
import os
import shutil
import tempfile
from typing import List

import qrcode
from dotenv import load_dotenv
from fastapi import Body, FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

import pdfplumber

from app.mpesa_parser import extract_mpesa_transactions

load_dotenv()

def _get_allowed_origins() -> List[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "*")
    if raw.strip() == "*":
        return ["*"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="RentScore API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VerifiedPayment(BaseModel):
    month: str = Field(..., description="Month or period label, e.g. 2024-07")
    amount: float = Field(..., description="Rent payment amount")
    narrative: str = Field(..., description="Original transaction narrative")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence")


class AnalysisResult(BaseModel):
    trust_score: int = Field(..., ge=0, le=100)
    verified_payments: List[VerifiedPayment]
    transactions: List[dict[str, str]] | None = None


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


def build_certificate_pdf(analysis: AnalysisResult) -> bytes:
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=LETTER)
    width, height = LETTER

    pdf.setTitle("RentScore Certificate")
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(0.9 * inch, height - 1.2 * inch, "RentScore Certificate")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(0.9 * inch, height - 1.7 * inch, "Trust Score")
    pdf.setFont("Helvetica-Bold", 32)
    pdf.drawString(0.9 * inch, height - 2.3 * inch, str(analysis.trust_score))

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(0.9 * inch, height - 3.0 * inch, "Verified Payments")

    pdf.setFont("Helvetica", 10)
    start_y = height - 3.4 * inch
    line_height = 0.25 * inch
    max_rows = 12
    for index, payment in enumerate(analysis.verified_payments[:max_rows]):
        y = start_y - (index * line_height)
        line = f"{payment.month} · KES {payment.amount:,.0f} · {payment.narrative}"
        pdf.drawString(0.9 * inch, y, line)

    if len(analysis.verified_payments) > max_rows:
        pdf.drawString(
            0.9 * inch,
            start_y - (max_rows * line_height),
            f"+ {len(analysis.verified_payments) - max_rows} more payments",
        )

    website_url = os.getenv("RENTSCORE_WEBSITE") or os.getenv(
        "RENT_SCORE_WEBSITE", "https://rentscore.app"
    )
    qr_image = qrcode.make(website_url)
    qr_buffer = io.BytesIO()
    qr_image.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    qr_reader = ImageReader(qr_buffer)
    qr_size = 1.2 * inch
    qr_x = width - qr_size - 0.8 * inch
    qr_y = 0.7 * inch
    pdf.drawImage(qr_reader, qr_x, qr_y, width=qr_size, height=qr_size, mask="auto")
    pdf.setFont("Helvetica", 8)
    pdf.drawRightString(width - 0.8 * inch, qr_y - 0.15 * inch, "Scan to verify")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer.getvalue()


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_statement(
    file: UploadFile = File(...),
    password: str | None = Form(None),
) -> AnalysisResult:
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty file upload.")

    extracted_rows: List[dict[str, str]] = []
    raw_text = ""

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp.flush()

            extracted_rows = extract_mpesa_transactions(tmp.name, password=password)

            if not extracted_rows:
                with pdfplumber.open(tmp.name, password=password) as pdf:
                    pages_text = [page.extract_text() or "" for page in pdf.pages]
                raw_text = "\n".join(pages_text).strip()
    except Exception as exc:  # pragma: no cover - defensive for PDF parsing issues
        raise HTTPException(status_code=400, detail="Failed to read PDF.") from exc

    if not extracted_rows and not raw_text:
        raise HTTPException(status_code=400, detail="No text found in PDF.")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set.")

    client = OpenAI(api_key=api_key)

    system_prompt = (
        "You are a risk analyst verifying rent payment consistency from M-Pesa "
        "statements. Identify recurring monthly outflows that represent rent, "
        "even if the narrative label varies. Output only JSON that matches the "
        "provided schema."
    )
    if extracted_rows:
        statement_payload = json.dumps(extracted_rows, ensure_ascii=False)
        user_prompt = (
            "Analyze the following M-Pesa transaction rows and identify rent payments. "
            "Return a trust_score from 0-100 based on consistency and provide a list "
            "of verified_payments with month, amount, narrative, and confidence (0-1).\n\n"
            f"STATEMENT_ROWS:\n{statement_payload}"
        )
    else:
        user_prompt = (
            "Analyze the following M-Pesa statement text and identify rent payments. "
            "Return a trust_score from 0-100 based on consistency and provide a list "
            "of verified_payments with month, amount, narrative, and confidence (0-1).\n\n"
            f"STATEMENT_TEXT:\n{raw_text}"
        )

    schema = {
        "name": "rent_verification",
        "schema": {
            "type": "object",
            "properties": {
                "trust_score": {"type": "integer", "minimum": 0, "maximum": 100},
                "verified_payments": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "month": {"type": "string"},
                            "amount": {"type": "number"},
                            "narrative": {"type": "string"},
                            "confidence": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                            },
                        },
                        "required": ["month", "amount", "narrative", "confidence"],
                    },
                },
            },
            "required": ["trust_score", "verified_payments"],
        },
    }

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_schema", "json_schema": schema},
        )
        payload = json.loads(response.output_text)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI analysis failed.") from exc

    analysis = AnalysisResult(**payload)
    if extracted_rows:
        analysis.transactions = extracted_rows
    return analysis


@app.post("/certificate")
def generate_certificate(payload: AnalysisResult = Body(...)) -> Response:
    pdf_bytes = build_certificate_pdf(payload)
    headers = {"Content-Disposition": "attachment; filename=rentscore-certificate.pdf"}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
