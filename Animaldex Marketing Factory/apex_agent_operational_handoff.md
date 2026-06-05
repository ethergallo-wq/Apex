# Apex Content Studio - Operational Handoff For TikTok Review

Prepared for the Apexdex agent  
Goal: complete the TikTok Developer submission for Login Kit + Content Posting API  
Current approach: beginner-safe review path with draft/inbox upload, not Direct Post

## Context

We are setting up TikTok API access so Apex can submit prepared educational animal discovery content to TikTok.

The first submission should be conservative:

```text
Login Kit
Content Posting API
user.info.basic
video.upload
Direct Post OFF
```

This means Apex Content Studio sends approved content to TikTok as a draft/inbox upload for creator review. Direct public auto-posting should be requested later, after this base integration is approved.

## Files To Read

All files are in:

```text
/Users/andreagalliazzo/Documents/Animaldex Marketing Factory
```

Read these files:

```text
apexdex_tiktok_legal_review_pack.md
apexdex_tiktok_demo_video_guide.md
server.js
README.md
.env.example
tiktok-review-copy.md
```

Most important:

```text
apexdex_tiktok_legal_review_pack.md
apexdex_tiktok_demo_video_guide.md
```

## Public Pages Already Needed

Verify these are live and publicly accessible:

```text
https://apexdex.app
https://apexdex.app/terms
https://apexdex.app/privacy
```

TikTok must be able to open the Terms and Privacy URLs without authentication.

## Required Callback URL

The TikTok Developer Portal redirect URI should be:

```text
https://apexdex.app/api/tiktok/callback
```

The deployed webapp must implement this endpoint and exchange TikTok's OAuth `code` for an access token.

## TikTok Developer Portal Configuration

Use:

```text
App name: Apex Content Studio
Platform: Web
Products: Login Kit, Content Posting API
Scopes: user.info.basic, video.upload
Direct Post: OFF
Terms of Service URL: https://apexdex.app/terms
Privacy Policy URL: https://apexdex.app/privacy
Redirect URI: https://apexdex.app/api/tiktok/callback
```

Do not add extra products or scopes for the first submission.

Do not enable Direct Post for the first submission unless we explicitly decide to accept a harder review.

## App Description

Use this short description:

```text
A content tool for creating, reviewing, and submitting educational animal discovery posts to TikTok.
```

## Review Explanation

Paste this in TikTok's "Explain how each product and scope works" field:

```text
Apex Content Studio uses Login Kit so an authorized user can connect their TikTok account before submitting content. The app requests user.info.basic only to display and confirm the connected TikTok account.

Apex Content Studio uses the Content Posting API with video.upload to send user-approved educational animal discovery content to TikTok as a draft/inbox upload. Before any content is sent to TikTok, the user reviews the post preview, edits the caption, confirms the selected account, and manually approves the submission.

The app does not publish or upload content without user confirmation. The integration is designed to give creators a controlled workflow for preparing and submitting original Apex educational content to TikTok.
```

## Required Demo Flow

Record a short MP4/MOV screen recording under 50 MB.

The video should show:

```text
1. Open https://apexdex.app.
2. Show Terms and Privacy links/pages.
3. Click Connect TikTok.
4. Authorize TikTok through Login Kit.
5. Return to Apex Content Studio.
6. Show the connected TikTok account.
7. Show a prepared educational animal discovery post.
8. Edit or review the caption.
9. Confirm manual approval.
10. Click Send approved post.
11. Show success/draft upload result.
```

Narration to use:

```text
This demo shows Apex Content Studio using TikTok Login Kit and the Content Posting API. The user connects TikTok, reviews original Apex educational content, edits the caption, confirms approval, and sends the content to TikTok as a draft/inbox upload. The app does not submit content without user confirmation.
```

## UI Requirements For Approval

The app should visibly include:

```text
Connected TikTok account
Content preview
Caption editor
Privacy or destination setting
Manual approval checkbox
Send approved post button
Terms and Privacy links
```

Recommended approval checkbox text:

```text
I confirm that I reviewed this content and approve sending it to TikTok as a draft/inbox upload.
```

## Technical Notes

The local sample implementation in `server.js` includes:

```text
GET /api/tiktok/callback
GET /terms
GET /privacy
GET /connect
GET /compose
POST /api/publish
```

Environment variables:

```text
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://apexdex.app/api/tiktok/callback
TIKTOK_SCOPES=user.info.basic,video.upload
APP_BASE_URL=https://apexdex.app
```

Never expose the client secret in frontend code, screenshots, or the demo video.

## Important Review Positioning

Use these words:

```text
creator-controlled workflow
manual approval
draft/inbox upload
original educational content
connected account confirmation
```

Avoid these words:

```text
bot
mass posting
automatic posting without user action
private internal automation only
bulk posting to many accounts
```

## Final Submission Checklist

Before submitting:

```text
[ ] Public homepage works.
[ ] Terms URL works.
[ ] Privacy URL works.
[ ] Redirect URI matches exactly.
[ ] Login Kit works.
[ ] TikTok connected account is displayed.
[ ] Content preview is shown.
[ ] Manual approval checkbox is required.
[ ] Submit/upload button works.
[ ] Demo video shows the full flow.
[ ] Products are only Login Kit + Content Posting API.
[ ] Scopes are only user.info.basic + video.upload.
[ ] Direct Post is OFF.
```

