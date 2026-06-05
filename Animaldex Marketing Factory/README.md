# Apex Content Studio

Mini app for the first TikTok Developer Review submission.

## Review configuration

Use this setup for the first submission:

```text
Products: Login Kit, Content Posting API
Scopes: user.info.basic, video.upload
Direct Post: OFF
Redirect URI: https://apexdex.app/api/tiktok/callback
Terms: https://apexdex.app/terms
Privacy: https://apexdex.app/privacy
```

Apex Content Studio does not request `video.publish` for the first review. It uses `video.upload` so approved content is sent as a draft/inbox upload for the creator to finish in TikTok.

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

## Demo checklist

Record a short demo that shows:

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

For TikTok review, `https://apexdex.app/api/tiktok/callback` must be served by the app that handles the OAuth callback. If Apex Content Studio is deployed separately, point the TikTok redirect URI to that deployed domain or route `apexdex.app/api/tiktok/callback` to this server.
