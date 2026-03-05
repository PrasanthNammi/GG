// Gmail Auto-Reply Script (time-driven trigger)
// Update OWNER_EMAIL and LOGO_URL before deploying.

const OWNER_EMAIL = "OWNER_EMAIL@gmail.com";
const LOGO_URL = "https://example.com/logo.png";
const REPLY_WINDOW_HOURS = 24;

function autoReplyUnread() {
  const label = getOrCreateLabel_("AutoReplied");
  const now = Date.now();
  const cutoffMs = REPLY_WINDOW_HOURS * 60 * 60 * 1000;

  const threads = GmailApp.search(
    'is:unread newer_than:1d -from:me -from:noreply -from:no-reply -from:mailer-daemon -from:postmaster'
  );

  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const msg of messages) {
      if (!msg.isUnread()) continue;

      const from = msg.getFrom();
      const email = extractEmail_(from);
      if (!email) continue;
      if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) continue;

      // Avoid loops / auto replies
      if (/no-?reply|mailer-daemon|postmaster/i.test(email)) continue;
      if (msg.getSubject().toLowerCase().includes("we received your message")) continue;

      // One reply per sender per 24 hours
      const key = `autoreply_${email.toLowerCase()}`;
      const last = getProp_(key);
      if (last && now - Number(last) < cutoffMs) {
        continue;
      }

      const name = extractName_(from) || "there";
      const safeName = escapeHtml_(name);

      const html = `
        <div style="font-family: Arial, sans-serif; color: #1f2a2a; line-height: 1.6;">
          <div style="margin-bottom: 16px;">
            <img src="${LOGO_URL}" alt="Grad Germany" style="max-width: 140px; height: auto;" />
          </div>
          <p>Hi ${safeName},</p>
          <p>Thanks for your email. We have received your message and will respond within 24 hours.</p>
          <p>If you have additional details, reply to this message.</p>
          <hr style="border: none; border-top: 1px solid #e2e6ea; margin: 18px 0;" />
          <p style="font-size: 12px; color: #6b7280;">
            Follow us: <a href="#" style="color: #6b7280;">LinkedIn</a> · <a href="#" style="color: #6b7280;">Instagram</a>
            <br>
            You are receiving this because you contacted us. If this was a mistake, you can ignore this email.
          </p>
        </div>
      `;

      GmailApp.sendEmail(email, "We received your message", "", { htmlBody: html });
      setProp_(key, String(now));
      label.addToThread(thread);
      msg.markRead();
    }
  }
}

function extractEmail_(from) {
  const match = from.match(/<([^>]+)>/);
  if (match) return match[1];
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) return from;
  return "";
}

function extractName_(from) {
  const match = from.match(/^(.*)\s<[^>]+>$/);
  return match ? match[1].replace(/\"/g, "").trim() : "";
}

function getOrCreateLabel_(name) {
  const existing = GmailApp.getUserLabelByName(name);
  return existing || GmailApp.createLabel(name);
}

function getProp_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function setProp_(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

function escapeHtml_(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
