import os
from typing import Dict, List, Optional

import pdfplumber

EXPECTED_HEADERS = [
    "Receipt No.",
    "Completion Time",
    "Details",
    "Transaction Status",
    "Paid In",

Set the global page background to bg-slate-50.

Update the 'Start Verification' button to use bg-gradient-to-r from-emerald-500 to-emerald-600 and add a shadow-lg shadow-emerald-500/30 glow.

Ensure all H1 and H2 headings are text-slate-900, not pure black.

In the 'How It Works' section, give the icon circles a light green background (bg-emerald-50) to make the green icons stand out more."
    "Withdrawn",
    "Balance",
]


def _normalize_row(row: List[Optional[str]]) -> List[str]:
    normalized = [(cell or "").strip() for cell in row]
    if len(normalized) < len(EXPECTED_HEADERS):
        normalized.extend([""] * (len(EXPECTED_HEADERS) - len(normalized)))
    return normalized[: len(EXPECTED_HEADERS)]


def extract_mpesa_transactions(
    pdf_path: str, password: Optional[str] = None
) -> List[Dict[str, str]]:
    """
    Extract M-Pesa transactions into a clean list of dictionaries.

    - Supports password-protected PDFs via the `password` argument.
    - Handles wrapped rows by merging continuation lines into the previous row.
    """
    rows: List[Dict[str, str]] = []
    current_row: Dict[str, str] | None = None

    max_pages = int(os.getenv("MAX_PAGES", "20"))
    with pdfplumber.open(pdf_path, password=password) as pdf:
        for page_index, page in enumerate(pdf.pages):
            if page_index >= max_pages:
                break
            tables = page.extract_tables() or []
            for table in tables:
                if not table or len(table) < 2:
                    continue

                header = _normalize_row(table[0])
                if header != EXPECTED_HEADERS:
                    continue

                for raw_row in table[1:]:
                    if not raw_row:
                        continue

                    normalized = _normalize_row(raw_row)

                    is_new_row = normalized[0] != ""
                    if is_new_row:
                        if current_row:
                            if not (
                                current_row["Transaction Status"] == "Completed"
                                and current_row["Details"] == ""
                            ):
                                rows.append(current_row)
                        current_row = dict(zip(EXPECTED_HEADERS, normalized))
                        continue

                    if current_row:
                        details = normalized[2]
                        if details:
                            current_row["Details"] = (
                                f"{current_row['Details']} {details}".strip()
                            )

                        for idx, key in enumerate(EXPECTED_HEADERS):
                            if idx == 2:
                                continue
                            if normalized[idx] and not current_row[key]:
                                current_row[key] = normalized[idx]

    if current_row and not (
        current_row["Transaction Status"] == "Completed" and current_row["Details"] == ""
    ):
        rows.append(current_row)

    return rows
