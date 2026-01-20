# RentScore Monorepo

## Structure
- `frontend/` Next.js 14 App Router + Tailwind UI
- `backend/` FastAPI service for PDF analysis

## Frontend
```
cd frontend
npm install
npm run dev
```

## Backend
```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=your_key_here
uvicorn app.main:app --reload --port 8000
```

## Local flow
1. Start the backend on `http://localhost:8000`.
2. Start the frontend on `http://localhost:3000`.
3. Upload a PDF on the landing page and view results.

## Deploy to Vercel
- Create a new Vercel project and set the Root Directory to `frontend/`.
- Add environment variable `NEXT_PUBLIC_API_URL` pointing to your deployed backend.
- Deploy the backend separately (FastAPI) and make sure it is reachable over HTTPS.
