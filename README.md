# Vouch: AI Video Resume Platform

Vouch lets a student record (or upload) a short video pitch and get it transcribed and scored by AI. The result is a shareable "Talent Pass" that recruiters can review next to other candidates. Recruiters can browse candidates, move them through a hiring pipeline, draft outreach emails, send AI-written rejection feedback, and book interviews.

**Result:** 2nd place at the GradSkill summership challenge (as stated by the project owner).

**Live demo:** https://vouch-ai-video-resume-platform.vercel.app

> This is a hackathon-style project. Some parts are fully wired to a backend, while others are mocked or hardcoded. The feature table and the "Known limitations" section below say which is which.

## Features

| Area | Feature | Status |
|---|---|---|
| Auth | Email and password sign-up/sign-in with a candidate or recruiter role (Supabase Auth, profile row created by `/api/auth/register-profile`) | Implemented |
| Candidate | Record in-browser (MediaRecorder, webm) or upload an mp4/webm video pitch, with a language choice (English, Hindi, Telugu, Tamil, Kannada, Spanish) | Implemented |
| Candidate | Speech transcription (Groq `whisper-large-v3`) and scoring (Gemini `gemini-2.5-flash`): communication, confidence, clarity, technical, overall, a short summary and skills | Implemented |
| Candidate | Filler-word, repeated-word and pause counts | Implemented as plain rule-based code (word list and regex), not AI |
| Candidate | Speaking pace | Approximation only: word count divided by an assumed 75-second duration, not measured from the video |
| Candidate | Pitch coach: tips, talking points and a teleprompter script generated from a pasted job description (Gemini) | Implemented |
| Candidate | Skill assessment (Frontend, Backend, Design): fixed multiple-choice questions, score saved to the `assessments` table | Implemented. The question bank is hardcoded in the page |
| Candidate | Mock interview (Frontend, Backend, Design): typed answers scored by Gemini, which returns feedback and a follow-up question | Implemented. The first question per domain is hardcoded. The interview is text only, with no voice or video |
| Candidate | Browse jobs and apply with your video resume | Implemented. If the `jobs` table is empty the page shows 4 hardcoded sample jobs (Razorpay, Zepto, CRED, Groww) |
| Candidate | Resume PDF upload (PDF only, "Max size 5MB" is shown in the UI) | Implemented. The size limit is only text in the UI and is not enforced in code |
| Candidate | Public/private toggle, profile-view history, interview list | Implemented (reads and writes Supabase) |
| Candidate | Talent Pass at `/share/[id]`: scorecard, video and QR code, downloadable as a PNG | Implemented. The QR image comes from the third-party `api.qrserver.com` service |
| Recruiter | Candidate list: job applications plus all completed video resumes, with fit score and skill filtering | Implemented, but see the mock data note below |
| Recruiter | Pipeline stages (Applied, Reviewed, Interview, Hired, Rejected) | Implemented for real candidates. Nothing is saved for the sample candidates |
| Recruiter | Post a job (also inserts an in-app notification row for every candidate profile) | Implemented |
| Recruiter | Outreach email generation (Gemini) | Draft text only. No email is sent anywhere |
| Recruiter | Rejection feedback (Gemini), saved to the application and shown to the candidate | Implemented |
| Recruiter | Schedule interview: saves an `interviews` row and sets the application stage to `interview` | Implemented as a database record only. It creates no calendar event and sends no invite. If no link is entered, a placeholder Google Meet URL is stored |

### Mock data in the recruiter dashboard

`src/app/recruiter/page.tsx` loads candidates from `/api/recruiter/candidates`. After that call, whether it succeeded or failed, **10 hardcoded sample candidates (ids `mock-vr-1` to `mock-vr-10`, with `example.com` emails and a sample w3schools video) are always appended to the list.** If the fetch fails or returns no rows, the list contains only those samples. Their names end in "(sample)" in the UI. Changes made to them are not saved to the database.

## Architecture

```
Browser (Next.js App Router, React 19)
  |-- Supabase JS client (anon key): auth, storage uploads, most reads/writes
  |-- /api/* route handlers (server side)
        |-- Supabase admin client (service-role key)
        |-- Groq: whisper-large-v3 (speech to text)
        |-- Gemini: gemini-2.5-flash (scoring, coaching, emails, feedback)
```

Video upload flow:
1. The browser uploads the video to the Supabase Storage bucket `videos` and gets a public URL.
2. The browser calls `POST /api/analyze` with that URL. The route inserts a `video_resumes` row with status `processing`.
3. The route downloads the video, transcribes it with Groq, and scores the transcript with Gemini.
4. The route computes the filler-word and hesitation statistics, saves everything to the row and returns it.

## Tech stack

- Next.js 16.2.6 (App Router, Turbopack), React 19.2.4, TypeScript 5
- Tailwind CSS 4, shadcn/ui and Radix UI, lucide-react, sonner, recharts
- Supabase (`@supabase/supabase-js`): auth, Postgres, storage
- Groq SDK (`groq-sdk`) for transcription, Google Generative AI SDK (`@google/generative-ai`) for LLM calls
- Also in `package.json`: react-hook-form, zod, TanStack Query, `@hello-pangea/dnd`, date-fns

## Environment variables

Put these in `.env.local`. Never commit them.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser and server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (browser client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin client used by API routes and the share page. Server only, never expose it |
| `GROQ_API_KEY` | Whisper transcription in `/api/analyze` |
| `GEMINI_API_KEY` | Gemini calls in analyze, pitch-coach, mock-interview, outreach and reject-feedback |

If the Supabase variables are missing, the code silently falls back to placeholder values, so requests fail at runtime instead of at startup.

## Running locally

Requires Node.js and npm.

```bash
npm install
# create .env.local with the five variables above
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`. `npm run build` was run successfully on a clean install while writing this README. No test script exists.

### Supabase setup (not documented in the repo)

The repository contains **no SQL schema, migrations or storage-policy files**, so the Supabase project has to be recreated by hand. From reading the code, it expects:

- **Storage buckets:** `videos` and `resumes`. Both are read through public URLs, so they must be public.
- **Tables and the columns the code reads or writes:**
  - `profiles`: `id`, `email`, `full_name`, `role` (`candidate` or `recruiter`), `company` (read for recruiters), `created_at`
  - `video_resumes`: `id`, `candidate_id`, `video_url`, `status`, `language`, `transcript`, `communication_score`, `confidence_score`, `clarity_score`, `technical_score`, `overall_score`, `ai_summary`, `skills`, `filler_words`, `speaking_pace`, `hesitations`, `is_public`, `resume_pdf_url`, `created_at`
  - `jobs`: `id`, `recruiter_id`, `title`, `company`, `location`, `description`, `required_skills`, `created_at`
  - `applications`: `id`, `candidate_id`, `job_id`, `video_resume_id`, `stage`, `rejection_feedback`, `created_at`
  - `interviews`: `id`, `application_id`, `candidate_id`, `recruiter_id`, `scheduled_at`, `meeting_link`, `notes`
  - `assessments`: `candidate_id`, `domain`, `score`, `total_questions`, `correct_answers`, `completed_at`
  - `profile_views`: `id`, `candidate_id`, `recruiter_id`, `recruiter_company`, `viewed_at`
  - `notifications`: `candidate_id`, `title`, `message`, `link`, `is_read`

  Foreign keys (`candidate_id` to `profiles.id`, etc.) are needed for the joined selects such as `profiles(*)` and `video_resumes(*)`. Column types, foreign keys and row-level security rules are not recorded anywhere in the repo.

## Known limitations

- **Authentication on API routes.** Every route except `register-profile` requires a Supabase access token (`Authorization: Bearer ...`, sent by the app through `src/lib/api-client.ts`) that is verified server side in `src/lib/server-auth.ts`. The user id always comes from the verified token. Recruiter-only routes (`recruiter/candidates`, `recruiter/outreach`, `recruiter/schedule-interview`) also check the caller's role, `reject-feedback` is limited to recruiters and the candidate who owns the application, and `video-resume` only returns the caller's own record. These checks were tested for rejection only (401/403/400 without a valid session); the signed-in path needs a configured Supabase project and was not exercised end to end.
- **`register-profile` runs before a session exists** (the user must confirm their email first). It is insert-only and never overwrites an existing profile, only accepts the `candidate` and `recruiter` roles, and requires an existing Supabase Auth account with the same id and email. Anyone can still choose the recruiter role when signing up, because recruiters are not vetted.
- **`/api/analyze` only fetches videos from this project's Supabase storage host**, rejects videos over 50 MB, and the video has to be uploaded by a signed-in user.
- **Rate limiting is best effort.** The AI endpoints use an in-memory per-user limiter. On serverless hosting every instance keeps its own counters, so this slows abuse but is not a global limit.
- **Private profiles:** `/share/[id]` shows "Profile is Private" for private resumes, with no bypass. There is no owner preview for private profiles. The share page still reads with the service-role key.
- **Row-level security is not documented in the repo.** The browser uses the anon key for most reads and writes, so the protection of those tables depends entirely on RLS rules in your Supabase project, which this repo does not record.
- **Little input validation.** LLM output is parsed as JSON with a regex and not schema-checked. Scores are saved as returned, and the transcript and job description are inserted directly into prompts.
- AI scores are generated from the **transcript text only**. Nothing analyses the video image, facial expression or tone of voice, and no accuracy or validity measurement has been done. Treat the scores as a demo feature, not a hiring decision tool.
- Mock and hardcoded data: see the recruiter and jobs notes in the feature table. The pitch coach falls back to a default name and skill list when none are supplied.
- Several errors are only logged to the console, and the app uses browser `alert()` in places. There are no automated tests.

## Credits

Built by [abhishekaj28](https://github.com/abhishekaj28). Transcription by Groq, language model by Google Gemini, backend services by Supabase, hosting on Vercel.
