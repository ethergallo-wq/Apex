# TikTok Review Copy

## App description

```text
A content tool that helps Apex create, review, and submit educational animal discovery posts to TikTok.
```

## Product and scope explanation

```text
Apex Content Studio uses Login Kit so an authorized Apex user can connect their TikTok account before sending content. The app requests user.info.basic only to confirm which TikTok account is connected.

Apex Content Studio uses the Content Posting API with video.upload to send approved Apex educational animal content to TikTok as a draft/inbox upload. The app shows a manual review screen before upload: the user can review the content preview, edit the caption, choose the draft/inbox destination setting, and must check an explicit approval checkbox before the app sends the content to TikTok.

Direct Post is OFF for this first submission. The app does not request video.publish and does not publish content automatically. The integration is intended for Apex-owned educational content about animal discovery, rarity, geography, and wildlife facts.
```

## Demo video narration

```text
In this demo, I open Apex Content Studio, connect a TikTok account using Login Kit, review an Apex educational animal post, edit the caption and destination setting, confirm manual approval, and send the approved post to TikTok as a draft/inbox upload through the Content Posting API.
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
Redirect URI: https://apexdex.app/api/tiktok/callback
Terms: https://apexdex.app/terms
Privacy: https://apexdex.app/privacy
```
