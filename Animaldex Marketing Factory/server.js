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

const sessions = new Map();

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

function getSession(req, res) {
  const cookies = parseCookies(req.headers.cookie || "");
  let id = cookies.session_id;
  if (!id || !sessions.has(id)) {
    id = crypto.randomBytes(24).toString("hex");
    sessions.set(id, {});
    res.setHeader("Set-Cookie", `session_id=${id}; Path=/; HttpOnly; SameSite=Lax`);
  }
  return sessions.get(id);
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
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
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
        <a href="/connect">Connect TikTok</a>
        <a href="/compose">Review post</a>
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
          <h1>Create animal discovery posts, then send only after human approval.</h1>
          <p>Apex Content Studio helps prepare educational animal content for TikTok. A user connects their TikTok account, reviews the caption and destination setting, then explicitly confirms before anything is sent to TikTok as a draft/inbox upload.</p>
          <div class="actions">
            <a class="button" href="/connect">Connect TikTok</a>
            <a class="button secondary" href="/compose">Review demo post</a>
          </div>
        </div>
        <aside class="panel">
          <h2>Review-ready flow</h2>
          <span class="status">${session.accessToken ? "TikTok connected" : "TikTok not connected"}</span>
          <div class="steps">
            <div class="step"><span class="num">1</span><span>User logs in with TikTok and authorizes the app.</span></div>
            <div class="step"><span class="num">2</span><span>User reviews Apex content, preview, caption, and destination.</span></div>
            <div class="step"><span class="num">3</span><span>User confirms the post manually before upload.</span></div>
            <div class="step"><span class="num">4</span><span>The app sends the approved content to TikTok as a draft/inbox upload using the Content Posting API.</span></div>
          </div>
        </aside>
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
        <p>Last updated: June 5, 2026</p>
        <p>Apex Content Studio is a content management tool used to prepare, review, and submit educational animal discovery content as TikTok draft/inbox uploads.</p>

        <h2>Use of the service</h2>
        <p>Users are responsible for reviewing all content before approving publication. The service is intended for Apex-owned or authorized content only.</p>

        <h2>TikTok integration</h2>
        <p>When a user connects a TikTok account, Apex Content Studio may use TikTok Login Kit and the TikTok Content Posting API to send content that the user has manually approved as a draft/inbox upload. Direct Post is not enabled for the first review submission.</p>

        <h2>Content responsibility</h2>
        <p>Users must ensure that all submitted content follows applicable laws, platform rules, copyright requirements, and TikTok community guidelines.</p>

        <h2>Changes</h2>
        <p>These terms may be updated as the product evolves. Continued use of the service means acceptance of the updated terms.</p>

        <h2>Contact</h2>
        <p>For questions about these terms, contact the Apex team through the official Apex support channel.</p>
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
        <p>Last updated: June 5, 2026</p>
        <p>Apex Content Studio is designed to collect only the information needed to connect a TikTok account and submit user-approved draft/inbox uploads.</p>

        <h2>Information we collect</h2>
        <p>When a user connects TikTok, the service may receive basic TikTok account information and authorization tokens provided through TikTok Login Kit. The service may also process post text, media URLs, selected privacy settings, and approval status.</p>

        <h2>How information is used</h2>
        <p>Information is used to identify the connected TikTok account, prepare reviewed content, and send manually approved draft/inbox uploads through TikTok's Content Posting API.</p>

        <h2>Data sharing</h2>
        <p>Approved content and required account authorization data may be shared with TikTok only as needed to provide the publishing integration. We do not sell personal data.</p>

        <h2>Data retention</h2>
        <p>Authorization data and content records are retained only as needed to operate the service, troubleshoot publishing, or comply with legal and platform requirements.</p>

        <h2>User control</h2>
        <p>Users can disconnect TikTok access from their TikTok account settings or by contacting the Apex team.</p>

        <h2>Contact</h2>
        <p>For privacy questions, contact the Apex team through the official Apex support channel.</p>
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

const server = http.createServer(async (req, res) => {
  try {
    const session = getSession(req, res);
    const url = new URL(req.url, config.appBaseUrl);

    if (req.method === "GET" && url.pathname === "/") {
      sendHtml(res, homePage(session));
      return;
    }

    if (req.method === "GET" && url.pathname === "/connect") {
      sendHtml(res, connectPage(session));
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
});

server.listen(PORT, HOST, () => {
  console.log(`Apex Content Studio running at http://${HOST}:${PORT}`);
});
