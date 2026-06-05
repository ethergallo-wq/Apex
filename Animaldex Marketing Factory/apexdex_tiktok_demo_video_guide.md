# Apexdex TikTok Demo Video Guide

Purpose: record a short TikTok Developer review demo for Apex Content Studio.

Recommended length: 60-120 seconds.

Format: screen recording, MP4 or MOV, under 50 MB.

## Goal

Show that Apex Content Studio uses:

```text
Login Kit
Content Posting API
user.info.basic
video.upload
```

The reviewer must clearly see:

```text
1. The webapp is real and public.
2. Terms and Privacy links exist.
3. The user connects TikTok.
4. The connected TikTok account is displayed.
5. The user previews the content.
6. The user edits or reviews the caption.
7. The user manually approves.
8. The content is sent to TikTok as a draft/inbox upload.
```

## Before Recording

Confirm these are ready:

```text
[ ] https://apexdex.app opens publicly.
[ ] https://apexdex.app/terms works.
[ ] https://apexdex.app/privacy works.
[ ] TikTok Developer Portal has the same website/domain.
[ ] Redirect URI matches the deployed callback exactly.
[ ] Products selected: Login Kit + Content Posting API.
[ ] Scopes selected: user.info.basic + video.upload.
[ ] A TikTok test/sandbox account is available.
[ ] A short demo media file or draft upload test is ready.
```

## Video Flow

### Scene 1: Public Webapp

Show:

```text
https://apexdex.app
```

Say:

```text
This is Apex Content Studio, a content workflow for preparing and submitting educational animal discovery posts to TikTok.
```

Click or point to:

```text
Terms
Privacy
```

### Scene 2: TikTok Login

Click:

```text
Connect TikTok
```

Show the TikTok authorization screen.

Say:

```text
The user connects their TikTok account using Login Kit.
```

Complete authorization.

### Scene 3: Connected Account

After redirect, show the review screen.

Point to:

```text
Connected TikTok account
```

Say:

```text
The app displays the connected TikTok account so the user knows where the content will be sent.
```

### Scene 4: Content Review

Show:

```text
Post title
Caption
Visibility
Video URL or content source
```

Edit the caption slightly.

Say:

```text
The user can review and edit the content before submission.
```

### Scene 5: Manual Approval

Check:

```text
I reviewed this content and approve sending it to TikTok.
```

Say:

```text
The app requires manual approval before any content is sent to TikTok.
```

Click:

```text
Send approved post
```

### Scene 6: Result

Show:

```text
TikTok API result
```

or:

```text
Manual approval captured
```

Say:

```text
The approved content is submitted through TikTok's Content Posting API as a draft/inbox upload for creator review.
```

## Short Narration Script

```text
This demo shows Apex Content Studio using TikTok Login Kit and the Content Posting API.

First, the user opens the public Apex Content Studio webapp. The Terms and Privacy pages are available from the public website.

The user connects their TikTok account through Login Kit. After authorization, Apex Content Studio shows the connected TikTok account so the user knows where content will be submitted.

The user then reviews an educational animal discovery post, edits the caption, confirms the content, and manually approves the submission.

Only after this approval does the app send the content to TikTok through the Content Posting API using video.upload as a draft/inbox upload.

The app does not submit content without user confirmation.
```

## What Not To Show Or Say

Avoid saying:

```text
automatic mass posting
bot
private internal tool
publishes without user action
bulk posting to many accounts
```

Use instead:

```text
creator-controlled workflow
manual approval
draft/inbox upload
original educational content
connected account confirmation
```

## Mac Recording Tip

Use QuickTime Player:

```text
File -> New Screen Recording
```

Record only the browser window if possible.

Keep the video short and clean. Do not show client secret, access tokens, or private credentials.
