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
- `POST /certificate` accepts the analysis JSON and returns a PDF certificate.
- `GET /health` for readiness checks.

## Fly.io deploy
1. Install the Fly CLI and login: `fly auth login`
2. From `backend/`, run: `fly launch --no-deploy`
3. Set secrets:RENTSCORE_WEBSITE
   - `fly secrets set OPENAI_API_KEY=...`
   - `fly secrets set RENT_SCORE_WEBSITE=https://rent-score-cyan.vercel.app`
   - `fly secrets set ALLOWED_ORIGINS=https://rent-score-cyan.vercel.app`
4. Deploy: `fly deploy`
