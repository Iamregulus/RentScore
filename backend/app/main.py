import io
import json
import os
from typing import List

import pdfplumber
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

app = FastAPI(title="RentScore API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_statement(file: UploadFile = File(...)) -> AnalysisResult:
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file upload.")

    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages_text = [page.extract_text() or "" for page in pdf.pages]
    except Exception as exc:  # pragma: no cover - defensive for PDF parsing issues
        raise HTTPException(status_code=400, detail="Failed to read PDF.") from exc

    raw_text = "\n".join(pages_text).strip()
    if not raw_text:
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
            model="gpt-4o",
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_schema", "json_schema": schema},
        )
        payload = json.loads(response.output_text)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI analysis failed.") from exc

    return AnalysisResult(**payload)
