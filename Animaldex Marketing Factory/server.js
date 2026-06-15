import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

loadEnv();

const config = {
  clientKey: process.env.TIKTOK_CLIENT_KEY || "",
  clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
  redirectUri:
    process.env.TIKTOK_REDIRECT_URI ||
    `http://${HOST}:${PORT}/api/tiktok/callback`,
  scopes: process.env.TIKTOK_SCOPES || "user.info.basic,video.upload",
  appBaseUrl: process.env.APP_BASE_URL || `http://${HOST}:${PORT}`,
};

const SESSION_COOKIE = "apex_session";
const TIKTOK_VERIFICATION_FILES = {
  "tiktokWGaGE2HF72mAdOO7t80FcrkBYC24Woou.txt":
    "tiktok-developers-site-verification=WGaGE2HF72mAdOO7t80FcrkBYC24Woou",
  "tiktokGS0T1SdaaDxwUh0kMwQhcvg4My8Eh7ru.txt":
    "tiktok-developers-site-verification=GS0T1SdaaDxwUh0kMwQhcvg4My8Eh7ru",
};

const demoPost = {
  title: "Questo animale sembra inventato. Invece esiste davvero.",
  caption:
    "La natura ha gia creato creature da collezione. Che rarita gli daresti? #Apex #animali #natura #wildlife #curiosita",
  videoUrl: "",
};

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return decodeSession(cookies[SESSION_COOKIE]) || {};
}

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.split("=");
        return [key, decodeURIComponent(value.join("="))];
      })
  );
}

function sendHtml(res, html, status = 200) {
  commitPendingSession(res);
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendJson(res, payload, status = 200) {
  commitPendingSession(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function redirect(res, location) {
  commitPendingSession(res);
  res.writeHead(302, { Location: location });
  res.end();
}

function sendTikTokVerificationFile(res, pathname) {
  const fileName = path.basename(pathname);
  if (!/^tiktok[A-Za-z0-9_-]+\.txt$/.test(fileName)) return false;

  if (TIKTOK_VERIFICATION_FILES[fileName]) {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    });
    res.end(TIKTOK_VERIFICATION_FILES[fileName]);
    return true;
  }

  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return false;

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
  res.end(fs.readFileSync(filePath, "utf8"));
  return true;
}

function commitPendingSession(res) {
  if (typeof res.commitSession === "function") res.commitSession();
}

function commitSession(res, session) {
  const secure = config.appBaseUrl.startsWith("https://") ? "; Secure" : "";
  const value = encodeSession(session);
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`
  );
}

function encodeSession(session) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", sessionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decodeSession(value) {
  if (!value) return null;
  try {
    const packed = Buffer.from(value, "base64url");
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const encrypted = packed.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", sessionKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

function sessionKey() {
  return crypto
    .createHash("sha256")
    .update(config.clientSecret || "apex-content-studio-local-session")
    .digest();
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function requireConfig() {
  return Boolean(config.clientKey && config.clientSecret);
}

function pageLayout({ title, session, body }) {
  const isConnected = Boolean(session.accessToken);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #171717;
      --muted: #666;
      --line: #ddd;
      --bg: #f7f6f2;
      --panel: #fff;
      --accent: #c85f3f;
      --accent-soft: #f6ded4;
      --accent-ink: #fff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--ink);
      letter-spacing: 0;
    }
    header {
      border-bottom: 1px solid var(--line);
      background: #fff;
    }
    .wrap {
      width: min(1040px, calc(100vw - 32px));
      margin: 0 auto;
    }
    .top {
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .brand strong { font-size: 18px; }
    .brand span { color: var(--muted); font-size: 13px; }
    nav {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    nav a {
      color: var(--ink);
      text-decoration: none;
      border: 1px solid var(--line);
      padding: 9px 12px;
      border-radius: 6px;
      background: #fff;
      font-size: 14px;
    }
    footer {
      border-top: 1px solid var(--line);
      padding: 20px 0 28px;
      background: #fff;
      color: var(--muted);
      font-size: 13px;
    }
    footer a { color: var(--ink); }
    main { padding: 32px 0 56px; }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr);
      gap: 20px;
      align-items: start;
    }
    .section { margin-top: 22px; }
    .cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 14px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
    }
    .card h3 { margin: 0 0 8px; font-size: 17px; }
    .list {
      margin: 12px 0 0;
      padding-left: 20px;
      color: var(--muted);
      line-height: 1.55;
    }
    .eyebrow {
      color: #8f3f28;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin: 0 0 8px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 20px;
    }
    h1 { margin: 0 0 12px; font-size: clamp(28px, 4vw, 46px); line-height: 1.02; }
    h2 { margin: 0 0 12px; font-size: 20px; }
    p { line-height: 1.55; color: var(--muted); }
    label { display: block; font-size: 13px; font-weight: 700; margin: 16px 0 6px; }
    input, textarea, select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 11px 12px;
      font: inherit;
      background: #fff;
    }
    textarea { min-height: 128px; resize: vertical; }
    button, .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 42px;
      border: 0;
      border-radius: 6px;
      padding: 0 16px;
      background: var(--accent);
      color: var(--accent-ink);
      font-weight: 750;
      text-decoration: none;
      cursor: pointer;
    }
    .button.secondary, button.secondary {
      color: var(--ink);
      background: #fff;
      border: 1px solid var(--line);
    }
    .status {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 13px;
      background: ${isConnected ? "#dff3eb" : "#eee"};
      color: ${isConnected ? "#0f5f4d" : "#555"};
    }
    .steps {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }
    .step {
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 10px;
      align-items: start;
      color: var(--muted);
    }
    .num {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      background: var(--accent-soft);
      color: #8f3f28;
      border-radius: 50%;
      font-weight: 800;
      font-size: 13px;
    }
    .notice {
      border-left: 4px solid var(--accent);
      background: var(--accent-soft);
      padding: 12px 14px;
      color: #73351f;
      border-radius: 6px;
    }
    .preview-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background:
        linear-gradient(180deg, rgba(200,95,63,.12), rgba(255,255,255,.92)),
        #fff;
    }
    .preview-card strong { display: block; margin-bottom: 8px; }
    .tiny { font-size: 12px; color: var(--muted); margin-top: 10px; }
    pre {
      overflow: auto;
      padding: 14px;
      background: #1f2426;
      color: #f3f6f4;
      border-radius: 8px;
      white-space: pre-wrap;
    }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
    @media (max-width: 780px) {
      .grid { grid-template-columns: 1fr; }
      .cards { grid-template-columns: 1fr; }
      .top { align-items: flex-start; flex-direction: column; padding: 14px 0; }
      nav { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <header>
    <div class="wrap top">
      <div class="brand">
        <strong>Apex Content Studio</strong>
        <span>Manual draft upload flow for TikTok</span>
      </div>
      <nav>
        <a href="/">Overview</a>
        <a href="/about">About</a>
        <a href="/services">Services</a>
        <a href="/contact">Contact</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </nav>
    </div>
  </header>
  <main class="wrap">${body}</main>
  <footer>
    <div class="wrap">Apex Content Studio uses TikTok Login Kit and Content Posting API only for user-approved draft/inbox uploads. <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a></div>
  </footer>
</body>
</html>`;
}

function homePage(session) {
  return pageLayout({
    title: "Apex Content Studio",
    session,
    body: `
      <section class="grid">
        <div>
          <p class="eyebrow">Official Website</p>
          <h1>Apex Content Studio</h1>
          <p>Apex Content Studio is a web-based content operations tool for Apex educational animal discovery media. The service helps an authorized creator prepare short-form post concepts, review copy, edit captions, confirm account identity, and submit approved content to TikTok as creator-controlled drafts.</p>
          <p>The website is operated for Apex content workflows and is not a public social network, marketplace, or automated publishing service. It provides information about the service, its TikTok integration, its data practices, and the authorized review workflow used by Apex collaborators.</p>
          <div class="actions">
            <a class="button" href="/about">Learn about the service</a>
            <a class="button secondary" href="/services">View services</a>
            <a class="button secondary" href="/terms">Terms</a>
            <a class="button secondary" href="/privacy">Privacy</a>
          </div>
        </div>
        <aside class="panel">
          <h2>Service summary</h2>
          <span class="status">${session.accessToken ? "TikTok connected" : "TikTok not connected"}</span>
          <p>Apex Content Studio supports internal preparation and review of educational animal discovery content before it is submitted to TikTok.</p>
          <ul class="list">
            <li>Human-reviewed content preparation</li>
            <li>Editable captions and content previews</li>
            <li>TikTok account confirmation with Login Kit</li>
            <li>Draft/inbox upload through Content Posting API</li>
          </ul>
        </aside>
      </section>
      <section class="section panel">
        <p class="eyebrow">How the service works</p>
        <h2>Creator-controlled review workflow</h2>
        <div class="steps">
          <div class="step"><span class="num">1</span><span>An authorized user opens Apex Content Studio and connects a TikTok account with TikTok Login Kit.</span></div>
          <div class="step"><span class="num">2</span><span>The service displays the connected account, a content preview, editable title and caption fields, and a draft/inbox destination setting.</span></div>
          <div class="step"><span class="num">3</span><span>The user reviews the material and confirms approval with a checkbox. The app does not send content without this confirmation.</span></div>
          <div class="step"><span class="num">4</span><span>Approved content is submitted to TikTok as a draft/inbox upload for the creator to finish in TikTok. Direct Post is off.</span></div>
        </div>
      </section>
      <section class="section panel">
        <p class="eyebrow">Authorized workflow</p>
        <h2>TikTok connection for approved users</h2>
        <p>The TikTok connection screens are available only to demonstrate or operate the authorized Apex review workflow. They are not the homepage of the public website and are not required for visitors who only need information about the service, legal terms, privacy practices, or contact details.</p>
        <div class="actions">
          <a class="button secondary" href="/connect">Open TikTok connection</a>
          <a class="button secondary" href="/compose">Open review workflow</a>
        </div>
      </section>
      <section class="section">
        <p class="eyebrow">Website and services</p>
        <h2>What Apex Content Studio provides</h2>
        <div class="cards">
          <div class="card">
            <h3>Content Review</h3>
            <p>Review screens for Apex educational animal discovery content, including title, caption, and preview information before upload.</p>
          </div>
          <div class="card">
            <h3>TikTok Integration</h3>
            <p>Login Kit is used to identify the connected TikTok account. Content Posting API is used only for user-approved draft/inbox uploads.</p>
          </div>
          <div class="card">
            <h3>User Control</h3>
            <p>The creator chooses whether to approve the upload. The app does not request Direct Post and does not publish automatically to a profile.</p>
          </div>
        </div>
      </section>
      <section class="section grid">
        <div class="panel">
          <h2>TikTok permissions used</h2>
          <p><strong>user.info.basic</strong> is used to display the connected TikTok account in the review screen.</p>
          <p><strong>video.upload</strong> is used to submit approved content as a TikTok draft/inbox upload. The creator remains responsible for final review in TikTok.</p>
        </div>
        <div class="panel">
          <h2>Contact</h2>
          <p>For support, terms, privacy, or data requests, contact the Apex team.</p>
          <p><strong>Support:</strong> support@apexdex.app<br /><strong>Privacy:</strong> privacy@apexdex.app</p>
        </div>
      </section>
    `,
  });
}

function aboutPage(session) {
  return pageLayout({
    title: "About Apex Content Studio",
    session,
    body: `
      <section class="panel">
        <p class="eyebrow">About</p>
        <h1>About Apex Content Studio</h1>
        <p>Apex Content Studio is the official web service used by Apex to prepare and review educational animal discovery content before it is submitted to TikTok as a creator-controlled draft/inbox upload.</p>
        <p>The service is operated by Andrea Galliazzo in Milan, Italy, and is designed for internal Apex use and authorized collaborators. It is not a public publishing network and it does not automatically publish content to TikTok profiles.</p>
        <h2>Purpose</h2>
        <p>The purpose of Apex Content Studio is to make the review process clear and auditable: an authorized user connects TikTok, checks the connected account, reviews a content preview, edits the caption, selects a draft destination setting, and confirms approval before upload.</p>
        <h2>Public information</h2>
        <p>This website houses information about the Apex Content Studio service, TikTok permissions, data handling practices, Terms of Service, Privacy Policy, and support contacts.</p>
      </section>
    `,
  });
}

function servicesPage(session) {
  return pageLayout({
    title: "Apex Content Studio Services",
    session,
    body: `
      <section class="panel">
        <p class="eyebrow">Services</p>
        <h1>Services</h1>
        <p>Apex Content Studio provides web-based content review tooling for Apex educational animal discovery workflows.</p>
        <div class="cards">
          <div class="card">
            <h3>Content Preparation</h3>
            <p>Structured review screens for short-form animal discovery post concepts, captions, media references, and creator notes.</p>
          </div>
          <div class="card">
            <h3>Manual Review</h3>
            <p>Human approval controls require the user to review the content and confirm approval before submission to TikTok.</p>
          </div>
          <div class="card">
            <h3>TikTok Draft Upload</h3>
            <p>TikTok Login Kit identifies the connected account. Content Posting API is used only for draft/inbox upload with Direct Post off.</p>
          </div>
        </div>
        <h2>TikTok permissions</h2>
        <p><strong>user.info.basic</strong> confirms the connected TikTok account. <strong>video.upload</strong> enables approved content to be submitted as a draft/inbox upload for the creator to finish in TikTok.</p>
      </section>
    `,
  });
}

function contactPage(session) {
  return pageLayout({
    title: "Contact Apex Content Studio",
    session,
    body: `
      <section class="panel">
        <p class="eyebrow">Contact</p>
        <h1>Contact</h1>
        <p>For questions about Apex Content Studio, TikTok integration, support, privacy, or data requests, contact the Apex team using the addresses below.</p>
        <p><strong>Operator:</strong> Andrea Galliazzo<br /><strong>Address:</strong> P'le Tripoli, 20146 Milano, Italy</p>
        <p><strong>Support:</strong> support@apexdex.app<br /><strong>Privacy:</strong> privacy@apexdex.app</p>
        <p>Authorized collaborators should use the TikTok connection and review workflow only when instructed by Apex.</p>
      </section>
    `,
  });
}

function connectPage(session) {
  const configured = requireConfig();
  return pageLayout({
    title: "Connect TikTok",
    session,
    body: `
      <section class="grid">
        <div class="panel">
          <h1>Connect TikTok</h1>
          <p>This screen starts TikTok Login Kit. TikTok asks the user to authorize Apex Content Studio before the app can prepare a draft/inbox upload for their account.</p>
          ${configured ? "" : `<p class="notice">Add your TikTok client key and secret to the .env file before starting OAuth.</p>`}
          <div class="actions">
            <a class="button ${configured ? "" : "secondary"}" href="${configured ? "/auth/tiktok" : "#"}">Continue with TikTok</a>
          </div>
        </div>
        <aside class="panel">
          <h2>Requested scopes</h2>
          <p><strong>user.info.basic</strong><br />Used to confirm the connected TikTok account.</p>
          <p><strong>video.upload</strong><br />Used to send approved content to TikTok as a draft/inbox upload for the creator to finish in TikTok.</p>
        </aside>
      </section>
    `,
  });
}

function composePage(session) {
  const tiktokUser = session.tiktokUser;
  const accountBlock = tiktokUser
    ? `<div class="notice">
        Connected TikTok account: <strong>${escapeHtml(
          tiktokUser.display_name || "TikTok user"
        )}</strong>
        ${
          tiktokUser.avatar_url
            ? `<br /><img src="${escapeAttr(
                tiktokUser.avatar_url
              )}" alt="" style="width:48px;height:48px;border-radius:50%;margin-top:10px;" />`
            : ""
        }
      </div>`
    : `<p class="notice">Connect TikTok before sending this content. The connected account will be shown here.</p>`;

  return pageLayout({
    title: "Review post",
    session,
    body: `
      <section class="grid">
        <form class="panel" method="post" action="/api/publish">
          <h1>Review Apex post</h1>
          <p>The content below is editable. The user must review the preview, choose a draft/inbox destination setting, and confirm before the app sends anything to TikTok.</p>
          ${accountBlock}

          <label for="title">Post title</label>
          <input id="title" name="title" maxlength="150" value="${escapeAttr(demoPost.title)}" />

          <label for="caption">Caption</label>
          <textarea id="caption" name="caption" maxlength="2200">${escapeHtml(demoPost.caption)}</textarea>

          <label for="privacy">Draft/inbox destination setting</label>
          <select id="privacy" name="privacy">
            <option value="SELF_ONLY">Only me / private test</option>
            <option value="MUTUAL_FOLLOW_FRIENDS">Friends review</option>
            <option value="PUBLIC_TO_EVERYONE">Creator can review public-ready content</option>
          </select>

          <label for="videoUrl">Public MP4 URL for draft/inbox upload test</label>
          <input id="videoUrl" name="videoUrl" placeholder="https://example.com/apex-demo.mp4" value="${escapeAttr(demoPost.videoUrl)}" />

          <label>
            <input name="approved" value="yes" type="checkbox" style="width:auto; margin-right:8px;" />
            I confirm that I reviewed this content and approve sending it to TikTok as a draft/inbox upload.
          </label>

          <div class="actions">
            <button type="submit">Send approved post</button>
            <a class="button secondary" href="/">Cancel</a>
          </div>
        </form>
        <aside class="panel">
          <h2>Current TikTok status</h2>
          <span class="status">${session.accessToken ? "TikTok connected" : "TikTok not connected"}</span>
          <p>Direct Post is intentionally off for the first review. Apex requests only user.info.basic and video.upload, then sends approved content as a draft/inbox upload for the creator to finish in TikTok.</p>
          <div class="preview-card">
            <strong>Content preview</strong>
            <p>${escapeHtml(demoPost.title)}</p>
            <p>${escapeHtml(demoPost.caption)}</p>
            <p class="tiny">No client secret, access token, or refresh token is shown in this interface.</p>
          </div>
        </aside>
      </section>
    `,
  });
}

function termsPage(session) {
  return pageLayout({
    title: "Terms of Service",
    session,
    body: `
      <section class="panel">
        <h1>Terms of Service</h1>
        <p>Last updated: June 15, 2026</p>
        <p>These Terms of Service govern access to and use of Apex Content Studio, a web-based content operations service operated by Andrea Galliazzo, P'le Tripoli, 20146 Milano, Italy ("Apex", "we", "us", or "our"). Apex Content Studio is used to prepare, review, and submit Apex educational animal discovery content to TikTok as creator-controlled draft/inbox uploads.</p>

        <h2>1. Acceptance of these Terms</h2>
        <p>By accessing or using Apex Content Studio, you agree to these Terms. If you do not agree, you must not use the service. These Terms apply together with our Privacy Policy and any product-specific instructions displayed in the service.</p>

        <h2>2. Eligibility and authorized use</h2>
        <p>Apex Content Studio is intended only for Apex internal users, contractors, and collaborators who are authorized to manage Apex content workflows. It is not a public social network, marketplace, or consumer publishing platform. You may use the service only if you have permission to do so and only in compliance with these Terms, applicable laws, TikTok rules, and any internal Apex content guidelines.</p>

        <h2>3. Service description</h2>
        <p>The service provides a review interface for educational animal discovery content. Authorized users can connect a TikTok account, view the connected account, review a content preview, edit captions and related metadata, select a draft/inbox destination setting, and manually approve content before submission.</p>

        <h2>TikTok integration</h2>
        <p>When you connect a TikTok account, Apex Content Studio uses TikTok Login Kit to confirm the connected account and may use TikTok's Content Posting API with the video.upload permission to submit approved content as a draft/inbox upload. Direct Post is not enabled. The service does not publish content automatically to a TikTok profile.</p>

        <h2>4. User approval and content responsibility</h2>
        <p>You are responsible for reviewing all content, captions, media, claims, and metadata before approval. You must ensure that content is accurate, appropriate, authorized, and compliant with applicable laws, copyright rules, privacy rights, publicity rights, TikTok policies, and community guidelines.</p>

        <h2>5. Content rights and limited license</h2>
        <p>Apex Content Studio, its interface, workflows, text, design, code, and service materials are owned by Apex or its licensors. You may not copy, reverse engineer, resell, or misuse the service except as expressly permitted. If you provide or approve content through the service, you represent that you have the rights and permissions required to use that content. You grant Apex a limited, non-exclusive, worldwide license to host, process, display, review, format, and submit the content solely as needed to operate Apex Content Studio and the TikTok integration.</p>

        <h2>6. Prohibited conduct</h2>
        <p>You may not use the service to submit unlawful, infringing, deceptive, harmful, hateful, harassing, sexually exploitative, violent, or otherwise prohibited content. You may not attempt to bypass approval flows, compromise security, scrape the service, interfere with TikTok systems, or use the integration in a way that violates TikTok terms or developer policies.</p>

        <h2>7. Third-party services</h2>
        <p>The service integrates with TikTok. Your use of TikTok is governed by TikTok's own terms, privacy policy, developer policies, and platform rules. Apex is not responsible for TikTok availability, review decisions, account actions, API limitations, or changes to TikTok services.</p>

        <h2>8. Account access and disconnection</h2>
        <p>You may revoke Apex Content Studio's TikTok access through TikTok account settings where available. If you no longer have authorization to use the service, you must stop using it and contact Apex support if access needs to be removed.</p>

        <h2>9. Service availability</h2>
        <p>Apex Content Studio is provided as a web-based operational tool and depends on third-party infrastructure, including Vercel and TikTok services. We aim to maintain a reliable service, but we do not guarantee uninterrupted availability, error-free operation, or compatibility with all devices, browsers, networks, or future TikTok API changes.</p>

        <h2>10. Changes to the service</h2>
        <p>We may update, suspend, limit, or discontinue any part of the service at any time, including workflows, scopes, documentation, review screens, or TikTok integration behavior, especially where required by law, security needs, or TikTok platform changes.</p>

        <h2>11. Disclaimers</h2>
        <p>The service is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, Apex disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted availability, and error-free operation.</p>

        <h2>12. Limitation of liability</h2>
        <p>To the fullest extent permitted by law, Apex will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, or for loss of profits, data, goodwill, content reach, account status, platform access, or business opportunities arising from use of or inability to use the service.</p>

        <h2>13. Indemnification</h2>
        <p>You agree to defend, indemnify, and hold harmless Apex from claims, damages, losses, liabilities, costs, and expenses arising from your misuse of the service, your violation of these Terms, your violation of third-party rights, or content you submit, approve, or attempt to upload through the service.</p>

        <h2>14. Governing law and venue</h2>
        <p>These Terms are governed by the laws of Italy, without regard to conflict-of-law rules. Any dispute arising from or relating to these Terms or the service will be submitted to the competent courts of Milan, Italy, unless mandatory consumer or data protection laws require otherwise.</p>

        <h2>15. Changes to these Terms</h2>
        <p>We may update these Terms from time to time. Continued use of the service after updates means acceptance of the updated Terms.</p>

        <h2>16. Contact</h2>
        <p>For questions about these Terms, contact support@apexdex.app.</p>
      </section>
    `,
  });
}

function privacyPage(session) {
  return pageLayout({
    title: "Privacy Policy",
    session,
    body: `
      <section class="panel">
        <h1>Privacy Policy</h1>
        <p>Last updated: June 15, 2026</p>
        <p>This Privacy Policy explains how Apex Content Studio, operated by Andrea Galliazzo, P'le Tripoli, 20146 Milano, Italy ("Apex", "we", "us", or "our"), collects, uses, shares, and protects information when an authorized user accesses the website, connects a TikTok account, reviews content, and submits approved content as a TikTok draft/inbox upload.</p>

        <h2>Summary of key points</h2>
        <p>Apex Content Studio is an internal/authorized creator workflow. We collect only information needed to operate the website, connect TikTok, display the connected account, support manual review, and submit approved draft/inbox uploads. We do not sell personal data, do not use marketing cookies, and do not enable automatic Direct Post publishing.</p>

        <h2>1. Information we collect</h2>
        <p>We collect information you provide or authorize through the service, including review text, captions, post titles, media URLs, selected destination settings, approval status, and support communications. When you connect TikTok, we may receive basic TikTok account information such as open ID, display name, and avatar URL through TikTok Login Kit.</p>
        <p>The service may also process OAuth access tokens, refresh tokens, OAuth state values, and session identifiers provided by or related to TikTok so the requested integration can function. These tokens are used to operate the TikTok connection and are not shown in the user interface.</p>

        <h2>2. Information collected automatically</h2>
        <p>We may collect limited technical information such as IP address, browser type, device information, pages visited, request timestamps, error logs, deployment logs, and cookie/session identifiers. This information is used for security, debugging, service operation, performance monitoring, and abuse prevention.</p>

        <h2>3. How we use information</h2>
        <p>We use information to provide and operate Apex Content Studio, identify the connected TikTok account, display the account in the review screen, prepare content previews, process user edits, record manual approval, submit approved draft/inbox uploads through TikTok's Content Posting API, troubleshoot errors, secure the service, respond to support requests, and comply with legal or platform obligations.</p>

        <h2>4. Legal bases for processing</h2>
        <p>Where the GDPR, UK GDPR, or similar privacy laws apply, we rely on appropriate legal bases, including performance of a service or pre-contractual steps, legitimate interests in operating and securing an authorized content workflow, consent where required for TikTok authorization or similar actions, and compliance with legal obligations. You may withdraw consent where processing is based on consent, without affecting processing that occurred before withdrawal.</p>

        <h2>5. How we share information</h2>
        <p>We share information with TikTok only as needed to provide the TikTok Login Kit and Content Posting API integration. This may include authorization data, connected account identifiers, approved content, captions, media URLs, and related upload metadata. We may also share information with infrastructure and hosting providers that help operate the service, or when required by law, security needs, or platform compliance. We do not sell personal information.</p>
        <p>Current service providers include Vercel for hosting, deployment, infrastructure, and runtime logs, and TikTok for account authorization and content upload functionality. At this stage, Apex Content Studio does not use a persistent application database, email marketing provider, analytics provider, or advertising cookies.</p>

        <h2>6. Cookies and session data</h2>
        <p>Apex Content Studio uses cookies or similar session storage to maintain login state, OAuth state, security checks, and connected-account workflow continuity. These cookies are necessary for the service to operate and are not used for third-party advertising, behavioral profiling, or marketing analytics.</p>

        <h2>7. Data retention</h2>
        <p>We retain information only for as long as reasonably necessary to provide the connected-account workflow, maintain security, troubleshoot upload issues, comply with legal obligations, and satisfy TikTok platform requirements. OAuth/session data is retained only while needed for the connected account workflow. Logs may be retained for security, debugging, abuse prevention, and operational reliability, and are deleted or anonymized when no longer needed.</p>

        <h2>8. User choices and control</h2>
        <p>You can revoke TikTok access through TikTok account settings where available. You may contact privacy@apexdex.app to request access, correction, deletion, or disconnection assistance, subject to identity verification, legal requirements, and operational limitations.</p>

        <h2>9. Privacy rights</h2>
        <p>Depending on your location, you may have rights to request access, correction, deletion, restriction, portability, objection to processing, or withdrawal of consent. If you are in the European Economic Area, the United Kingdom, or Switzerland, you may also have the right to lodge a complaint with your local data protection authority. We will respond to requests in accordance with applicable law.</p>

        <h2>10. Security</h2>
        <p>We use reasonable administrative, technical, and organizational safeguards designed to protect information handled by the service. No internet service can be guaranteed to be completely secure, and users should avoid submitting credentials or sensitive personal data in content fields.</p>

        <h2>11. International processing</h2>
        <p>Information may be processed in Italy, the European Economic Area, the United States, and other locations where Apex, Vercel, TikTok, or related infrastructure operate. Where required, we rely on appropriate transfer mechanisms, safeguards, or provider commitments designed to protect personal information in accordance with applicable law.</p>

        <h2>12. Do Not Track</h2>
        <p>Some browsers offer a Do Not Track signal. Because there is no uniform industry standard for responding to these signals, Apex Content Studio does not currently respond to Do Not Track signals. The service does not use third-party advertising cookies.</p>

        <h2>13. Children's privacy</h2>
        <p>Apex Content Studio is intended for authorized users managing Apex content workflows and is not directed to children. We do not knowingly collect personal information from children through this service.</p>

        <h2>14. Changes to this policy</h2>
        <p>We may update this Privacy Policy as the service changes or as legal, operational, or platform requirements evolve. The updated date above indicates the latest revision.</p>

        <h2>15. Contact</h2>
        <p>For privacy questions or data requests, contact privacy@apexdex.app. For general support, contact support@apexdex.app.</p>
      </section>
    `,
  });
}

async function startTikTokAuth(req, res, session) {
  if (!requireConfig()) {
    sendHtml(res, "Missing TikTok config. Add .env values first.", 500);
    return;
  }

  const state = crypto.randomBytes(16).toString("hex");
  session.oauthState = state;
  const params = new URLSearchParams({
    client_key: config.clientKey,
    scope: config.scopes,
    response_type: "code",
    redirect_uri: config.redirectUri,
    state,
  });
  redirect(res, `https://www.tiktok.com/v2/auth/authorize/?${params}`);
}

async function handleTikTokCallback(req, res, session) {
  const url = new URL(req.url, config.appBaseUrl);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    sendHtml(res, `TikTok returned an error: ${escapeHtml(error)}`, 400);
    return;
  }

  if (!code || state !== session.oauthState) {
    sendHtml(res, "Invalid TikTok callback state.", 400);
    return;
  }

  const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });

  const tokenPayload = await tokenResponse.json();
  if (!tokenResponse.ok) {
    sendJson(res, tokenPayload, tokenResponse.status);
    return;
  }

  session.accessToken = tokenPayload.access_token;
  session.refreshToken = tokenPayload.refresh_token;
  session.tiktokUser = await fetchTikTokUser(session.accessToken);
  redirect(res, "/compose");
}

async function fetchTikTokUser(accessToken) {
  try {
    const fields = "open_id,union_id,avatar_url,display_name";
    const response = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=${encodeURIComponent(fields)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const payload = await response.json();
    return payload?.data?.user || null;
  } catch {
    return null;
  }
}

async function publishPost(req, res, session) {
  const body = new URLSearchParams(await readBody(req));
  const approved = body.get("approved") === "yes";
  const title = body.get("title") || "";
  const caption = body.get("caption") || "";
  const privacy = body.get("privacy") || "SELF_ONLY";
  const videoUrl = body.get("videoUrl") || "";

  if (!approved) {
    sendHtml(res, "Please approve the post before sending it to TikTok.", 400);
    return;
  }

  if (!session.accessToken) {
    sendHtml(res, "Connect TikTok before sending a post.", 401);
    return;
  }

  if (!videoUrl) {
    sendHtml(
      res,
      pageLayout({
        title: "Demo result",
        session,
        body: `<div class="panel"><h1>Manual approval captured</h1><p>This demo confirms the review step. Add a public MP4 URL to test the TikTok Content Posting API upload initialization call.</p><pre>${escapeHtml(
          JSON.stringify({ title, caption, privacy, approved, uploadMode: "draft/inbox" }, null, 2)
        )}</pre><a class="button" href="/compose">Back</a></div>`,
      })
    );
    return;
  }

  const initResponse = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: {
          title: caption || title,
          privacy_level: privacy,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    }
  );

  const result = await initResponse.json();
  sendHtml(
    res,
    pageLayout({
      title: "TikTok API result",
      session,
      body: `<div class="panel"><h1>TikTok API result</h1><p>The approved post was sent to TikTok's Content Posting API initialization endpoint for draft/inbox upload.</p><pre>${escapeHtml(
        JSON.stringify(result, null, 2)
      )}</pre><a class="button" href="/compose">Back</a></div>`,
    }),
    initResponse.ok ? 200 : initResponse.status
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

async function appHandler(req, res) {
  try {
    const url = new URL(req.url, config.appBaseUrl);
    if (req.method === "GET" && sendTikTokVerificationFile(res, url.pathname)) {
      return;
    }

    const session = getSession(req);
    res.commitSession = () => commitSession(res, session);

    if (req.method === "GET" && url.pathname === "/") {
      sendHtml(res, homePage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/connect") {
      sendHtml(res, connectPage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/about") {
      sendHtml(res, aboutPage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/services") {
      sendHtml(res, servicesPage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/contact") {
      sendHtml(res, contactPage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/compose") {
      sendHtml(res, composePage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/terms") {
      sendHtml(res, termsPage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/privacy") {
      sendHtml(res, privacyPage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/auth/tiktok") {
      await startTikTokAuth(req, res, session);
      return;
    }

    if (
      req.method === "GET" &&
      (url.pathname === "/auth/tiktok/callback" ||
        url.pathname === "/api/tiktok/callback")
    ) {
      await handleTikTokCallback(req, res, session);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/publish") {
      await publishPost(req, res, session);
      return;
    }

    sendHtml(res, "Not found", 404);
  } catch (error) {
    console.error(error);
    sendHtml(res, "Apex Content Studio encountered an error. No credentials or tokens are shown in the browser.", 500);
  }
}

export default appHandler;

if (!process.env.VERCEL) {
  const server = http.createServer(appHandler);
  server.listen(PORT, HOST, () => {
    console.log(`Apex Content Studio running at http://${HOST}:${PORT}`);
  });
}
