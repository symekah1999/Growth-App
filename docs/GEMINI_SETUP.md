# Using Gemini (free tier) for the assistant

1. Go to https://aistudio.google.com/apikey, sign in, click **Create API key** (no card needed for the free tier).
2. In Vercel: Project → Settings → Environment Variables, add `GEMINI_API_KEY` = your key (Production + Preview). Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`; use any current Flash model ID shown in AI Studio).
3. Redeploy (Deployments → ⋯ → Redeploy). The assistant now uses Gemini automatically.
4. For local dev add the same lines to `.env.local`.

Provider choice: `AI_PROVIDER=gemini|anthropic` forces one; otherwise Gemini is used if `GEMINI_API_KEY` is set, else Anthropic if `ANTHROPIC_API_KEY` is set.

Notes: free-tier limits are low and set by Google (check aistudio.google.com/rate-limit); a 429 shows "limit reached — wait a minute". Google may use free-tier prompts to improve its products, so avoid pasting very sensitive journal content or switch to a paid key / Anthropic.
