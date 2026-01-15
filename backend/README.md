# RentScore Backend

## Setup
1. Create a virtual environment.
2. Install dependencies:
   `pip install -r requirements.txt`
3. Export your API key:
   `export OPENAI_API_KEY=...`

## Run
`uvicorn app.main:app --reload --port 8000`

## Endpoints
- `POST /analyze` accepts a PDF and returns a trust score with payments.
- `GET /health` for readiness checks.
