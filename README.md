# Aether-Insights

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` and set:
   - `GEMINI_API_KEY` (if needed by your AI Studio workflow)
   - `RAPIDAPI_KEY` (required for backend RapidAPI proxy routes)
   - optional: `VITE_FLIPKART_CATEGORY_ID=clo`
3. Run unified frontend + backend on the same port:
   `npm run dev`
4. Open:
   - `http://localhost:8787/` (frontend)
   - `http://localhost:8787/api/flipkart/sub-categories?categoryId=clo` (backend Flipkart API)
   - `http://localhost:8787/api/amazon/product-details?asin=B07ZPKBL9V&country=US` (backend Amazon API)

## Run Backend API Proxy

1. Start backend server (same as unified dev server):
   `npm run backend:dev`
2. Health check:
   `http://localhost:8787/health`
3. Amazon product details (backend):
   `http://localhost:8787/api/amazon/product-details?asin=B07ZPKBL9V&country=US`

This keeps your RapidAPI key on the backend and avoids exposing it in browser code.
