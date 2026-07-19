# Gahena Backend

## Structure

- `app/core` - config, security, dependencies
- `app/routers` - API route handlers
- `app/services` - business logic
- `app/schemas` - request and response models

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API URL: `http://localhost:8000`
