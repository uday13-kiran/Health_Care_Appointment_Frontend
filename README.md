# HealthCare Frontend — Emerald Ink + Champagne Claymorphism

A complete React + Vite + TypeScript frontend designed around the supplied FastAPI healthcare appointment and queue-management backend.

## Design

- Emerald Ink: `#064E3B`
- Supporting emeralds: `#0B6B52`, `#0F7B60`
- Champagne / cream surfaces
- Claymorphism cards with soft inset/outset shadows
- Rounded, low-noise tables and forms
- Responsive desktop/tablet/mobile layouts
- Local illustrated SVG avatars for Admin, Doctor, Patient and Receptionist
- Role-specific navigation and dashboard content

## Backend integration

The frontend uses the FastAPI + PostgreSQL backend and supports these important flows:

- `POST /api/v1/auth/register/patient` — create patient account + patient profile
- `POST /api/v1/auth/register/doctor` — create doctor account + doctor profile
- `POST /api/v1/auth/login` — role-aware login
- `GET /api/v1/auth/me` — current account plus linked `profile_id`
- `POST/GET /api/v1/patients` and patient lookup
- `POST/GET /api/v1/doctors` and doctor lookup
- `POST/GET /api/v1/appointments`
- `GET /api/v1/appointments/patient/{patient_id}`
- `GET /api/v1/appointments/doctor/{doctor_id}`
- `POST /api/v1/appointments/{appointment_id}/cancel`
- `POST /api/v1/appointments/{appointment_id}/check-in`
- `POST/GET /api/v1/availability/doctor/{doctor_id}`
- `POST /api/v1/leaves/doctor/{doctor_id}`
- `GET /api/v1/queue/doctor/{doctor_id}`
- `GET /api/v1/queue/patient/{patient_id}`
- `POST /api/v1/queue/doctor/{doctor_id}/call-next`
- `POST /api/v1/queue/{entry_id}/start`
- `POST /api/v1/queue/{entry_id}/complete`
- visit and doctor workload/report endpoints

### Registration flow

Patients and doctors now see a registration option before login. Registration creates both the authentication user and the linked clinical profile, so the account can immediately be used on the login screen. Admin and receptionist accounts remain admin-managed.

### Appointment → queue flow

Booking an appointment intentionally does **not** put the patient in the live queue immediately. The patient first needs to check in. The backend then automatically creates the queue entry, so the frontend shows `Check in & queue`. The live flow is:

```text
Book → SCHEDULED → Check in → IN_QUEUE/WAITING → Call next → CALLED → Start → IN_CONSULTATION → Complete
```

This prevents someone who merely booked a future appointment from appearing in today's live waiting queue.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

For macOS/Linux:

```bash
cp .env.example .env
npm install
npm run dev
```

Set `.env` to your backend:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DEMO_MODE=false
```

For a deployed backend, use the public API URL, for example:

```env
VITE_API_BASE_URL=https://your-api.example.com/api/v1
```

Do not put database passwords, JWT secrets, or other backend secrets in the frontend environment. Vite variables are public to the browser.

## Demo mode

Set:

```env
VITE_DEMO_MODE=true
```

The UI then loads sample patients/doctors/appointments/queue data and accepts any login credentials. This is useful for previewing the design before the backend is deployed.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deployment options

### Vercel

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Framework: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add `VITE_API_BASE_URL` in Project Environment Variables.
7. Add `VITE_DEMO_MODE=false`.

`vercel.json` is included so client-side routes such as `/patients` and `/queue` resolve to `index.html`.

### Netlify

1. Import the repository.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Add `VITE_API_BASE_URL` and `VITE_DEMO_MODE=false`.

`netlify.toml` is already included with an SPA redirect.

### Docker / any container host

```bash
docker build -t healthcare-frontend .
docker run -p 8080:80 healthcare-frontend
```

The included Nginx config keeps React Router routes working after a refresh.

## Important backend notes found during integration

### 1. CORS must be enabled on FastAPI

The supplied backend does not currently show `CORSMiddleware`. When frontend and backend are deployed on different origins, add CORS middleware in `app/main.py` with the exact frontend production URL(s).

Example pattern:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For development, you can temporarily include `http://localhost:5173`.

### 2. Patient/doctor profile IDs are not returned by `/auth/me`

The current `/auth/me` response contains `id`, `email`, and `role`, but not `patient_id` or `doctor_id`. The frontend therefore cannot reliably infer a logged-in user's linked patient/doctor profile.

The Patient Settings page includes a local `patient_id` helper for the current backend. For a cleaner production UX, extend `/auth/me` to return the linked profile ID.

### 3. There is no general appointment list endpoint

The supplied backend exposes a patient-specific appointment list and individual appointment lookup, but no admin/receptionist/doctor list endpoint. The frontend therefore does not invent one. In live mode it displays the available backend data and explains when a list cannot be loaded.

A useful production endpoint would be something like:

```text
GET /api/v1/appointments?date=YYYY-MM-DD&doctor_id=...
```

### 4. There is no leave list endpoint

The frontend includes leave creation because the backend exposes `POST /leaves/doctor/{doctor_id}`, but it does not pretend there is a GET leave-history endpoint.

### 5. Avatars

The backend models supplied do not expose an avatar URL. The frontend therefore includes local SVG role avatars in `public/avatars/`. They are used consistently throughout the UI so the design does not lose its visual character.

If you later add `avatar_url` to the backend, pass that URL into the `Avatar` component and keep the local SVG as a fallback.

## Folder structure

```text
healthcare_frontend/
├─ public/
│  └─ avatars/
│     ├─ admin.svg
│     ├─ doctor.svg
│     ├─ patient.svg
│     └─ receptionist.svg
├─ src/
│  ├─ api/
│  │  ├─ client.ts
│  │  └─ demo.ts
│  ├─ components/
│  ├─ context/
│  ├─ layouts/
│  ├─ pages/
│  ├─ types/
│  ├─ utils/
│  ├─ main.tsx
│  ├─ styles.css
│  └─ vite-env.d.ts
├─ .env.example
├─ Dockerfile
├─ netlify.toml
├─ nginx.conf
├─ package.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts
```


## Updated workflow

- Patients choose doctor + date only; appointment time is assigned by the backend.
- Patient appointment actions are limited to cancelling their own appointment.
- Patient queue is read-only.
- Doctors see only their own queue and see patient names instead of IDs.
- Admin owns doctor working-hour configuration; doctors add breaks up to 45 minutes.
- Doctor leave requests require admin approval.
- Consultation is presented as clinical documentation after the live queue reaches the consultation stage.
- Admin dashboard includes today's care-flow analytics.
- Admin/Receptionist can pause a doctor queue and create an emergency assignment.
