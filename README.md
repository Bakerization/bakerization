## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Use `.env.example` as the source of truth.  
For Vercel, register the same keys in Project Settings -> Environment Variables.

Required for production:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
EMAIL_ADDRESS=
```

Optional (contact mail behavior):

```env
CONTACT_TO=
CONTACT_FROM=
CONTACT_SEND_CONFIRMATION=true
CONTACT_CONFIRM_SUBJECT=
CONTACT_CONFIRM_TEXT=
CONTACT_CONFIRM_HTML=
```

Notes:

- `NEXTAUTH_URL` must be your production URL on Vercel (not `http://localhost:3000`).
- `DATABASE_URL` is required to persist blog posts. If unset, blog list/detail returns empty during runtime.
- `BLOB_READ_WRITE_TOKEN` is required for blog image upload and `/api/blob/*` proxy reads.
