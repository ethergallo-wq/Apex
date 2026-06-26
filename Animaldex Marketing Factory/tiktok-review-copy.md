# TikTok Review Copy

## App description

```text
A web content studio for creating, reviewing, and submitting educational animal discovery posts to TikTok.
```

## Product and scope explanation

```text
Apex Content Studio uses Login Kit so an authorized Apex user can connect a TikTok account before submitting content. The app requests user.info.basic only to confirm and display which TikTok account is connected in the review screen.

Apex Content Studio uses the Content Posting API with video.upload to send approved Apex educational animal content to TikTok as a draft/inbox upload. The website shows a manual review workflow before upload: the user can review the content preview, edit the title and caption, choose the draft/inbox destination setting, and must check an explicit approval checkbox before the service sends anything to TikTok.

Direct Post is OFF. Apex Content Studio does not request video.publish and does not publish content automatically. The integration is used for Apex educational content about animal discovery, rarity, geography, and wildlife facts.
```

## Review video narration

```text
In this video, I open Apex Content Studio on the verified website domain, connect a TikTok account using Login Kit, review an Apex educational animal post, edit the caption and destination setting, confirm manual approval, and send the approved post to TikTok as a draft/inbox upload through the Content Posting API.
```

## Requested products

```text
Login Kit
Content Posting API
```

## Requested scopes

```text
user.info.basic
video.upload
```

## Redirect and legal URLs

```text
Website URL: https://apex-content-studio.vercel.app/
Redirect URI: https://apex-content-studio.vercel.app/api/tiktok/callback
Terms: https://apex-content-studio.vercel.app/terms
Privacy: https://apex-content-studio.vercel.app/privacy
```
