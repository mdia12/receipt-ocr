# Receipt OCR Backend

This is the FastAPI backend for the Receipt OCR SaaS. It handles file uploads, OCR processing via Google Cloud Vision, data parsing, and export generation (Excel/PDF).

## Deployment on Render

1.  **Create a new Web Service** on Render.
2.  **Connect your repository**.
3.  **Settings**:
    *   **Runtime**: Python 3
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4.  **Environment Variables**:
    Add the following environment variables in the Render dashboard:

    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_SERVICE_KEY`: Your Supabase Service Role Key (secret).
    *   `GCP_SERVICE_ACCOUNT_JSON_BASE64`: Base64 encoded content of your Google Cloud Service Account JSON key.
    *   `BUCKET_RAW`: `receipts_raw` (Create this bucket in Supabase)
    *   `BUCKET_PDF`: `receipts_pdf` (Create this bucket in Supabase)
    *   `BUCKET_EXCEL`: `receipts_excel` (Create this bucket in Supabase)

## Local Development

1.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Set environment variables (create a `.env` file or export them).
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```

## API Endpoints

*   `POST /upload`: Upload a receipt image/PDF.
*   `GET /status/{job_id}`: Check processing status.
*   `GET /receipts/{id}/download?format=pdf`: Get download link.
