# NyayaVoice

**Understand your consumer rights by speaking naturally.** NyayaVoice is a voice-first consumer-rights assistant focused on India. Ask in Hindi, Hinglish, or English to get practical next steps, relevant sources, an evidence checklist, and help drafting a complaint.

> NyayaVoice provides general information, not legal advice. It cannot guarantee an outcome or submit a complaint on your behalf. Check the linked official sources and verify important legal information before acting.

## What it does

- Answers consumer-rights questions in a text chat, with links to retrieved sources.
- Accepts microphone recordings for speech-to-text questions and voice conversations.
- Keeps signed-in conversations available in the dashboard.
- Can read answers aloud and return voice responses.
- Includes a scripted landing-page demo with sample content.

### The demo and the dashboard are different

The landing-page demo is a frontend-only animation using sample data in `client/lib/data.ts`. It does not record audio or call the backend. The authenticated dashboard at `/dashboard` is the real application flow: it records audio in the browser and sends the request to the API.

## Screenshots

Add screenshots here when ready.

## System architecture

```text
Browser
  ├─ Landing page: scripted sample content
  └─ Dashboard: Clerk sign-in → text or microphone input
       │ Bearer token + JSON or WAV upload
       ▼
FastAPI
  ├─ Verify Clerk JWT
  ├─ For voice input: Gnani Prisma speech-to-text
  ├─ Embed question with Gemini
  ├─ Retrieve matching document chunks from Supabase
  ├─ Generate a source-grounded answer with Gemini
  ├─ Save conversation and messages in Supabase
  └─ For voice output: generate a short spoken response and call Gnani Timbre
       │ Answer, source links, and optional audio
       ▼
Dashboard
```

For chat, the backend loads recent conversation history, retrieves up to five relevant knowledge chunks, and sends the question and retrieved context to Gemini. Source details are returned with the answer. Voice input first goes through speech recognition; voice conversations also generate and return WAV audio.

## Demo video

Add a link to the NyayaVoice demo video here.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 15 App Router, React 19, TypeScript |
| Authentication | Clerk (`@clerk/nextjs`) |
| Backend API | Python, FastAPI, Uvicorn |
| Language model | Google Gemini (`gemini-3.5-flash-lite`) |
| Embeddings | Google Gemini (`gemini-embedding-2`, 768 dimensions) |
| Retrieval and persistence | Supabase, with a `match_document_chunks` RPC |
| Speech | Gnani Prisma STT and Timbre TTS |

## Repository layout

```text
client/
  app/                    Next.js routes, metadata, styles, SEO
  components/             Landing page and dashboard UI
  components/dashboard/ Chat, voice recorder, conversation history
  lib/api.ts              Authenticated API client and response types
  lib/data.ts             Landing-page demo, FAQ, links, and sample content
server/
  app/api/v1/              FastAPI routes
  app/core/                Settings, Supabase client, Clerk JWT verification
  app/services/            Chat, conversation, RAG, Gemini, and Gnani integrations
  data/knowledge/           Local Markdown knowledge source
  scripts/                 Knowledge ingestion utility
  tests/                   Manual integration/smoke scripts
```

## Run locally

### Prerequisites

- Node.js 20 or newer and npm.
- Python 3.10 or newer.
- Clerk, Google Gemini, Gnani, and Supabase projects/credentials for the live dashboard and API.

### 1. Configure the frontend

Create `client/.env.local` (you can start from `client/.env.example`) and set:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Set the Clerk values from your Clerk project. Never commit secret keys. `NEXT_PUBLIC_API_URL` is the FastAPI origin only; do not append `/api/v1`.

Install dependencies and start Next.js:

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing page and scripted demo can render without the backend, but signing in and using the dashboard requires the services below.

### 2. Configure and run the backend

Create `server/.env` with these settings:

```dotenv
GNANI_API_KEY_ID=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLERK_FRONTEND_API_URL=
```

`CLERK_FRONTEND_API_URL` must be the issuer/domain for the same Clerk instance used by the frontend. Keep all credentials server-side; especially never expose the Supabase service-role key in a `NEXT_PUBLIC_*` variable.

Install and launch the API from the `server` directory so its `.env` is loaded:

```bash
cd server
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API health check is at [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health); interactive API docs are at `/docs`.

### 3. Configure Supabase

The backend expects the following database objects:

- `conversations` and `messages` for per-user chat history.
- `sources` and `document_chunks` for the knowledge base.
- A `match_document_chunks` RPC accepting `query_embedding`, `match_threshold`, and `match_count`, and returning matching chunk content, metadata, source IDs, and similarity.

The repository does not include SQL migrations for these objects. Set up the schema, vector extension/function, and row-level access policies in your Supabase project before using the live API. The backend uses the service-role key, so keep it private and use the application's user-ownership checks for conversation access.

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Frontend | FastAPI origin, without `/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Frontend | Canonical URL, sitemap, robots, and social metadata |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend | Clerk browser configuration |
| `CLERK_SECRET_KEY` | Frontend/server runtime | Clerk server-side configuration |
| `CLERK_FRONTEND_API_URL` | Backend | Clerk JWT issuer and JWKS host |
| `GNANI_API_KEY_ID` | Backend | Gnani speech API credential |
| `GEMINI_API_KEY` | Backend | Gemini generation and embeddings |
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Server-only Supabase access |

Use environment variables in your hosting provider for deployment. Do not commit `.env` files, screenshots containing secrets, or real user recordings.

## API overview

Versioned application endpoints are under `/api/v1`. Except for the backend root welcome route and `/health`, API routes require a Clerk Bearer token.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Backend welcome/status response |
| `GET` | `/health` | Unauthenticated service health |
| `GET` | `/health/protected` | Authenticated token check |
| `POST` | `/chat` | Send a text question; accepts `message` and optional `conversation_id` |
| `GET` | `/conversations/` | List the signed-in user's conversations |
| `GET` | `/conversations/{conversation_id}/messages` | Load messages for an owned conversation |
| `POST` | `/voice/stt` | Transcribe an uploaded audio file |
| `POST` | `/voice/ask` | Transcribe audio and return a text answer |
| `POST` | `/voice/conversation` | Transcribe audio and return an answer with generated speech |
| `POST` | `/voice/tts` | Convert supplied text to WAV speech |

Chat responses include a `conversation_id`, answer text, source references, and an optional speech-ready response. Voice requests use multipart form data with an `audio` file; the ask/conversation routes can also receive a `conversation_id`.

## Knowledge base

The checked-in ingestion utility is `server/scripts/ingest_markdown.py`. It chunks `server/data/knowledge/offline_pricing_mrp.md`, creates Gemini embeddings, and upserts them into Supabase. Before running it, configure the backend environment, ensure the matching source record exists (the script currently uses source ID `7`), and review the destination schema.

The checked-in MRP document is explicitly marked **research draft** and calls for primary-source verification. The live retrieval results also depend on what has been ingested into your Supabase project. Review and verify legal material before using it for production answers.

## Development checks

Frontend:

```bash
cd client
npm run typecheck
npm run build
```

Backend smoke scripts in `server/tests/` call external services and Supabase; they are not isolated unit tests. Run them only after configuring valid credentials and data, with the `server` directory on `PYTHONPATH`:

```bash
PYTHONPATH=. python tests/test_rag.py
PYTHONPATH=. python tests/test_retrieval.py
```

In Windows PowerShell, set `$env:PYTHONPATH = (Get-Location).Path` from `server` before running the same `python tests/...` commands.

## Security, privacy, and limitations

- Clerk protects the dashboard. The API verifies bearer tokens using Clerk's JWKS and checks conversation ownership before reading or writing messages.
- Microphone audio is captured in the browser, uploaded to the backend, and sent to Gnani for transcription. The code does not save uploaded audio to the project database; chat text and assistant responses are persisted in Supabase.
- Gemini answers depend on the retrieved material and can be incomplete or incorrect. A source link is not a substitute for checking the source itself.
- This is not a law firm, legal representative, complaint-filing service, or guarantee of a legal result. Users decide whether to contact a seller, helpline, regulator, or lawyer.
- Browser recordings require microphone permission and a secure context in deployed environments.
- The current backend CORS allowlist and Clerk token `azp` check are hard-coded for `http://localhost:3000` in `server/app/main.py` and `server/app/core/security.py`. Update both to the exact deployed frontend origin before deployment; also configure the Clerk instance for that origin.
- Do not use the project with sensitive personal data until the deployment, provider data handling, database access policies, and privacy notices have been reviewed.

## Deployment

The frontend and API are separate applications:

1. Deploy `client/` to a Next.js host such as Vercel and set the frontend environment variables there.
2. Deploy `server/` to a Python host with a start command such as `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Configure the backend environment variables and Supabase schema/knowledge base.
4. Set `NEXT_PUBLIC_API_URL` to the backend origin and `NEXT_PUBLIC_SITE_URL` to the public frontend URL.
5. Update the backend CORS and Clerk allowed-origin checks to match the deployed frontend URL, then verify the health check and authenticated chat/voice flows.

Fonts use `next/font/google`, so the frontend build must be able to fetch the font files.

## Author

- Name: [Your name]
- GitHub: [Your GitHub profile]
- LinkedIn: [Your LinkedIn profile]
- Email: [Your contact email]
