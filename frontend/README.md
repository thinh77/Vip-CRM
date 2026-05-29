<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/009f295b-88ff-4af0-8c52-30c222af4f2d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## PERN Local Development

Start PostgreSQL and create databases:

```bash
createdb vip_crm
createdb vip_crm_test
```

Backend:

```bash
cd ../backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

Frontend:

```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:3000.
