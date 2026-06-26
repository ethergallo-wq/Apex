# Apex Content Studio

Apex Content Studio is the official web service used by Apex to prepare, review, and submit educational animal discovery content to TikTok as creator-controlled draft/inbox uploads.

## Review configuration

Use this setup for TikTok Developer review:

```text
Products: Login Kit, Content Posting API
Scopes: user.info.basic, video.upload
Direct Post: OFF
Website URL: https://apex-content-studio.vercel.app/
Redirect URI: https://apex-content-studio.vercel.app/api/tiktok/callback
Terms: https://apex-content-studio.vercel.app/terms
Privacy: https://apex-content-studio.vercel.app/privacy
```

Apex Content Studio does not request `video.publish`. It uses `video.upload` so approved content is sent as a draft/inbox upload for the creator to finish in TikTok.

## Local setup

Copy the environment template:

```bash
cp .env.example .env
```

For local testing, temporarily change:

```text
TIKTOK_REDIRECT_URI=http://127.0.0.1:3000/api/tiktok/callback
APP_BASE_URL=http://127.0.0.1:3000
```

Start:

```bash
npm start
```

Open:

```text
http://127.0.0.1:3000
```

## Review video checklist

Record a short review video that shows:

1. Account TikTok connected through Login Kit.
2. Content preview.
3. Editable caption.
4. Draft/inbox destination setting.
5. Manual approval checkbox.
6. Send/upload button.
7. Upload/result screen.
8. Public Terms and Privacy links.

Do not show client secret, access tokens, refresh tokens, or private credentials in the video.

## Operational note

For TikTok review, the Website URL, Redirect URI, Terms URL, Privacy URL, and the website shown in the review video should use the same Apex Content Studio Vercel domain.

## Vercel deployment

Recommended project name:

```text
apex-content-studio
```

After deployment, use the generated Vercel URL as the TikTok Login Kit redirect base:

```text
https://apex-content-studio.vercel.app/api/tiktok/callback
```

Set these production environment variables in Vercel:

```text
TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
TIKTOK_REDIRECT_URI=https://apex-content-studio.vercel.app/api/tiktok/callback
TIKTOK_SCOPES=user.info.basic,video.upload
APP_BASE_URL=https://apex-content-studio.vercel.app
```

Then use these values in TikTok Developer Portal:

```text
Website URL: https://apex-content-studio.vercel.app/
Redirect URI: https://apex-content-studio.vercel.app/api/tiktok/callback
Terms: https://apex-content-studio.vercel.app/terms
Privacy: https://apex-content-studio.vercel.app/privacy
```
