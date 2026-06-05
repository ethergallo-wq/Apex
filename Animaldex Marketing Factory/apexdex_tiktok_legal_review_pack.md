# Apexdex TikTok Legal Review Pack

Prepared for: Apexdex / Apex Content Studio  
Purpose: Terms of Service and Privacy Policy structure optimized for TikTok Developer review  
Last updated: June 5, 2026

Important note: This document is a legal-style implementation brief and draft policy pack. It is designed to help maximize TikTok review clarity, but it is not a substitute for review by a qualified lawyer in the relevant jurisdiction.

---

## 1. Executive Guidance For The Apexdex Agent

TikTok does not approve an API client simply because the owner wants to automate posting. TikTok reviews whether the app gives creators clear control, requests only necessary permissions, has a real public web presence, and explains how TikTok products/scopes are used.

For Apexdex, the safest positioning is:

> Apex Content Studio is a creator-facing content management tool that helps users prepare, review, and submit educational animal discovery content to TikTok. Users remain in control of every post.

Avoid describing the app as:

> A private automation tool for posting to our own TikTok account.

That framing is risky because TikTok's guidelines discourage apps that are merely private/internal utility tools.

Recommended initial review path:

```text
Product: Login Kit
Product: Content Posting API
Scopes: user.info.basic, video.upload
Direct Post: OFF initially
Publishing behavior: upload to TikTok draft/inbox for creator review
```

Then, after the basic flow is approved and stable:

```text
Request Direct Post
Add video.publish or photo publish scope if TikTok makes it available for the selected API flow
Show stricter manual review, preview, privacy selection, creator info, and final consent
```

---

## 2. TikTok Review Requirements To Satisfy

The Apexdex implementation should visibly satisfy these items:

1. Public website/webapp URL must not be only a login page.
2. Terms of Service and Privacy Policy links must be visible and active on the public website.
3. App name should match the website/app name.
4. App description should clearly explain what the app does.
5. Only required scopes should be requested.
6. Demo video must show the real webapp domain and the complete integration flow.
7. Demo video must show all selected products and scopes.
8. The user must see which TikTok account is connected.
9. The user must preview the content before sending it to TikTok.
10. The user must manually approve before sending/publishing.
11. Privacy options must be user-selected and aligned with TikTok creator info options when using Direct Post.
12. The app must not publish without the user's awareness and control.
13. Avoid unnecessary promotional watermarks, logos, links, or promotional overlay text inside content submitted to TikTok.

Recommended footer links on the public webapp:

```text
Terms
Privacy
Contact
```

Recommended public URLs:

```text
https://apexdex.app/terms
https://apexdex.app/privacy
```

---

## 3. TikTok Developer Portal Copy

### App Name

```text
Apex Content Studio
```

### App Description

Must be 120 characters or fewer if TikTok enforces the visible app description limit:

```text
A content tool for creating, reviewing, and submitting educational animal discovery posts to TikTok.
```

Alternative if more room is available:

```text
Apex Content Studio helps users create, review, and submit educational animal discovery content to TikTok.
```

### Products

```text
Login Kit
Content Posting API
```

### Scopes For First Submission

```text
user.info.basic
video.upload
```

### Scope Explanation For Review Box

```text
Apex Content Studio uses Login Kit so an authorized user can connect their TikTok account before submitting content. The app requests user.info.basic only to display and confirm the connected TikTok account.

Apex Content Studio uses the Content Posting API with video.upload to send user-approved educational animal discovery content to TikTok as a draft/inbox upload. Before any content is sent to TikTok, the user reviews the post preview, edits the caption, confirms the selected account, and manually approves the submission.

The app does not publish or upload content without user confirmation. The integration is designed to give creators a controlled workflow for preparing and submitting original Apexdex educational content to TikTok.
```

### Demo Video Script

Show this exact flow:

```text
1. Open https://apexdex.app
2. Show visible Terms and Privacy links.
3. Click "Connect TikTok".
4. Complete TikTok authorization.
5. Return to Apex Content Studio.
6. Show connected TikTok account.
7. Open a prepared Apexdex post.
8. Show content preview.
9. Edit caption.
10. Confirm the content is approved.
11. Click "Send to TikTok".
12. Show success response or draft upload confirmation.
```

Narration:

```text
This demo shows Apex Content Studio using Login Kit and the Content Posting API. The user connects TikTok, reviews original Apexdex educational content, edits the caption, confirms approval, and sends the content to TikTok as a draft/inbox upload. The app does not submit content without user confirmation.
```

---

## 4. Terms Of Service Draft

Publish this page at:

```text
https://apexdex.app/terms
```

Page title:

```text
Terms of Service
```

Draft:

```text
Terms of Service
Last Updated: June 5, 2026

These Terms of Service ("Terms") govern access to and use of Apex Content Studio and related Apexdex services (collectively, the "Service"). The Service is operated by Apexdex ("Apexdex," "we," "us," or "our").

By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.

1. Service Overview

Apex Content Studio is a content management tool that helps users prepare, review, and submit educational animal discovery content to TikTok and other supported channels. The Service may include content planning, post previews, caption editing, media preparation, account connection, and user-approved content submission features.

2. User Control And Approval

The Service is designed to keep users in control of content submitted through connected third-party platforms. Before content is sent to TikTok through Apex Content Studio, the user must review the content, confirm the connected account, and approve the submission. Apexdex does not intend for the Service to publish or upload content without user awareness and confirmation.

3. TikTok Integration

If you connect a TikTok account, the Service may use TikTok Login Kit and TikTok's Content Posting API to support content submission. TikTok may require you to authorize access and may show the permissions requested by Apex Content Studio.

The Service may use TikTok permissions only for the purposes disclosed in the user interface and in our Privacy Policy. TikTok content submission may be subject to TikTok's own terms, policies, community guidelines, music usage rules, branded content rules, technical limits, review processes, and API restrictions.

You are responsible for ensuring that any content you submit through the Service complies with TikTok's requirements and all applicable laws.

4. Account Connection

You are responsible for maintaining control of your connected accounts. You should only connect accounts that you are authorized to use. You may disconnect third-party platform access through the relevant platform settings or by contacting us.

5. Content Responsibility

You retain responsibility for content that you create, upload, approve, or submit through the Service. You represent and warrant that you have all rights, permissions, and licenses necessary to use and submit such content, including any images, videos, captions, music, trademarks, names, likenesses, and other materials included in the content.

You must not use the Service to submit content that is unlawful, misleading, infringing, harmful, abusive, adult, discriminatory, deceptive, spam-like, or otherwise violates applicable platform policies.

6. No Unauthorized Automation

You must not use the Service to spam, mass-post abusive content, impersonate others, manipulate engagement, evade platform limits, or publish content without proper user authorization. Apexdex may limit, suspend, or disable access where use appears unsafe, abusive, or non-compliant.

7. Third-Party Services

The Service may interoperate with third-party services such as TikTok. Apexdex does not control third-party services and is not responsible for their availability, functionality, decisions, review outcomes, restrictions, account actions, or policy changes.

8. Intellectual Property

The Service, including software, interface design, workflows, branding, and documentation, is owned by Apexdex or its licensors. Subject to these Terms, Apexdex grants you a limited, non-exclusive, non-transferable right to use the Service for its intended purpose.

You retain ownership of content you provide, but you grant Apexdex a limited license to host, process, display, transmit, and otherwise use that content as necessary to operate the Service.

9. Privacy

Our Privacy Policy explains how we collect, use, and protect information. By using the Service, you acknowledge our Privacy Policy.

10. Service Changes

We may update, suspend, modify, or discontinue parts of the Service at any time, including to comply with third-party platform requirements or legal obligations.

11. Disclaimers

The Service is provided on an "as is" and "as available" basis. Apexdex does not guarantee that content submissions will be accepted, published, displayed, monetized, or remain available on any third-party platform.

12. Limitation Of Liability

To the maximum extent permitted by law, Apexdex will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, data, goodwill, content, account access, or platform availability arising from use of the Service.

13. Termination

We may suspend or terminate access to the Service if we believe a user has violated these Terms, applicable law, platform requirements, or security standards.

14. Updates To These Terms

We may update these Terms from time to time. The updated version will be posted on this page with a revised "Last Updated" date. Continued use of the Service after updates means you accept the updated Terms.

15. Contact

For questions about these Terms, contact us at:

Email: support@apexdex.app
Website: https://apexdex.app
```

Agent notes:

- Replace `support@apexdex.app` with a real monitored email.
- If there is a legal company name, replace "Apexdex" with the full legal entity name.
- Add governing law only after confirming jurisdiction with the founder/legal counsel.

---

## 5. Privacy Policy Draft

Publish this page at:

```text
https://apexdex.app/privacy
```

Page title:

```text
Privacy Policy
```

Draft:

```text
Privacy Policy
Last Updated: June 5, 2026

This Privacy Policy explains how Apexdex ("Apexdex," "we," "us," or "our") collects, uses, shares, and protects information when users access Apex Content Studio and related Apexdex services (collectively, the "Service").

1. Information We Collect

We collect information needed to operate the Service, provide content management features, and support user-approved integrations with third-party platforms such as TikTok.

Information may include:

- Account information, such as name, email address, and login details if users create an Apexdex account.
- TikTok account information provided through TikTok Login Kit, such as open ID, display name, avatar, and other basic profile information authorized by the user.
- Authorization information, such as access tokens or refresh tokens, where needed to operate connected platform features.
- Content information, such as captions, post text, media URLs, images, videos, post previews, selected privacy settings, approval status, and submission history.
- Technical information, such as IP address, browser type, device information, logs, error events, timestamps, and usage activity.
- Communications, such as messages sent to support or feedback submitted through the Service.

2. How We Use Information

We use information to:

- Provide and operate the Service.
- Allow users to connect a TikTok account.
- Display the connected TikTok account so users know which account they are using.
- Prepare, preview, edit, and submit user-approved content.
- Send approved content to TikTok through TikTok's Content Posting API.
- Maintain security, prevent abuse, troubleshoot errors, and enforce limits.
- Improve the Service and user experience.
- Comply with legal, security, and platform requirements.

3. TikTok Integration

When a user connects TikTok, TikTok may provide authorized account information and tokens to the Service. We use this information only to support the connected TikTok workflow shown to the user.

For the initial Content Posting API flow, Apex Content Studio may use video.upload to send approved content to TikTok as a draft/inbox upload. If Direct Post is later enabled and approved, the Service may use additional TikTok publishing permissions only after the user reviews and approves the content.

The Service is designed so users can review content and approve submission before content is sent to TikTok.

4. How We Share Information

We may share information:

- With TikTok, when necessary to authenticate a user or submit user-approved content through TikTok APIs.
- With service providers that help us host, secure, monitor, or operate the Service.
- If required by law, legal process, security obligations, or enforceable governmental request.
- In connection with a business transaction, such as merger, acquisition, financing, or sale of assets.

We do not sell personal information.

5. Data Retention

We retain information only for as long as reasonably necessary to provide the Service, maintain security, troubleshoot issues, comply with legal or platform requirements, and support legitimate business needs.

Authorization tokens are retained only as needed to operate connected account features. Users may disconnect third-party platform access through the platform's settings or by contacting us.

6. User Choices And Controls

Users may:

- Review content before submission.
- Choose not to approve a content submission.
- Disconnect TikTok access through TikTok account settings.
- Request support regarding access, deletion, or correction of account information, subject to legal and technical limitations.

7. Security

We use reasonable technical and organizational measures designed to protect information. However, no online service is completely secure, and we cannot guarantee absolute security.

8. Children's Privacy

The Service is not intended for children under the age required by applicable law to use the Service. We do not knowingly collect personal information from children in violation of applicable law.

9. International Data

Information may be processed in countries other than the user's country of residence. Where required, we use appropriate safeguards for international data transfers.

10. Third-Party Services

The Service may link to or integrate with third-party services such as TikTok. Their privacy practices are governed by their own policies. Users should review those policies before using connected features.

11. Changes To This Privacy Policy

We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised "Last Updated" date. Continued use of the Service after updates means the updated policy applies.

12. Contact

For privacy questions or requests, contact us at:

Email: privacy@apexdex.app
Website: https://apexdex.app
```

Agent notes:

- Replace `privacy@apexdex.app` with a real monitored email.
- If there is a legal entity, insert the entity name.
- If Apexdex serves EU users, add GDPR-specific rights language before launch.
- If Apexdex serves California users, add CCPA/CPRA language before launch.
- If minors may use the service, obtain specific legal review before publishing.

---

## 6. UX Copy To Add Before TikTok Submission Button

Use this for `video.upload`:

```text
I confirm that I reviewed this content and approve sending it to TikTok as a draft/inbox upload.
```

Use this for Direct Post if/when enabled:

```text
I confirm that I reviewed this content and approve posting it to TikTok.
By posting, I agree to TikTok's Music Usage Confirmation.
```

For commercial/branded content flows, update the declaration according to TikTok's branded content requirements.

---

## 7. Implementation Checklist Before TikTok Submission

The Apexdex agent should confirm:

```text
[ ] https://apexdex.app opens without login.
[ ] Terms link is visible without opening a menu.
[ ] Privacy link is visible without opening a menu.
[ ] /terms is live and readable.
[ ] /privacy is live and readable.
[ ] App name in TikTok Developer Portal is "Apex Content Studio".
[ ] App icon matches Apexdex/Apex branding and is not confused with TikTok.
[ ] Platform selected: Web only.
[ ] Redirect URI exactly matches deployed callback URL.
[ ] Products selected: Login Kit + Content Posting API.
[ ] Scopes selected: user.info.basic + video.upload only for first submission.
[ ] Demo video uses the same domain submitted in the Developer Portal.
[ ] Demo video shows connected account.
[ ] Demo video shows content preview.
[ ] Demo video shows manual user approval.
[ ] Demo video shows upload/submission result.
[ ] No unneeded products/scopes are selected.
```

---

## 8. Red Flags To Avoid

Do not write these phrases in the TikTok submission:

```text
Automatically posts to TikTok without user action.
Private internal tool for our team only.
Bot for bulk posting.
Mass publishing automation.
Scrapes or reposts content from other platforms.
Publishes to accounts we manage without creator review.
```

Safer wording:

```text
Creator-controlled content submission workflow.
Users review and approve every post.
Original educational animal discovery content.
Draft/inbox upload for creator final review.
Manual confirmation before submission.
```

---

## 9. Final Recommendation

For the first TikTok review, do not overclaim direct automatic public posting. Submit a clean, conservative app:

```text
Apex Content Studio
Login Kit
Content Posting API
user.info.basic
video.upload
Draft/inbox upload
Manual review and approval
```

After this is approved and the workflow is stable, request Direct Post as a second stage.
