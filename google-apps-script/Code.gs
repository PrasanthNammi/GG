// Google Apps Script: Form submit handler (bound to the Google Sheet)
// Update OWNER_EMAIL and LOGO_URL before deploying.

const OWNER_EMAIL = "OWNER_EMAIL@gmail.com";
const LOGO_URL = "https://example.com/logo.png";

function onFormSubmit(e) {
  try {
    const named = e.namedValues || {};
    const name = getFirst(named, "Name");
    const email = getFirst(named, "Email");
    const message = getFirst(named, "Message");
    const challenge = getFirst(named, "Challenge");
    const timestamp = getFirst(named, "Timestamp");

    const sheet = e.range.getSheet();
    const row = e.range.getRow();

    if (!isValidEmail(email)) {
      writeStatus(sheet, row, "Rejected: invalid email");
      return;
    }

    if (String(challenge).trim() !== "7") {
      writeStatus(sheet, row, "Rejected: failed challenge");
      return;
    }

    if (isRateLimited(email)) {
      writeStatus(sheet, row, "Rejected: rate limited");
      return;
    }

    const safeName = escapeHtml(name || "there");
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message || "(empty)");
    const safeTimestamp = escapeHtml(timestamp || new Date().toISOString());

    // Owner notification
    const ownerSubject = `New Contact Form Submission - ${name || "Unknown"}`;
    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2a2a;">
        <h2 style="margin: 0 0 12px;">New Contact Form Submission</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 6px 0; width: 120px;"><strong>Name</strong></td><td>${safeName}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Email</strong></td><td>${safeEmail}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Timestamp</strong></td><td>${safeTimestamp}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Message</strong></td><td>${safeMessage.replace(/\n/g, "<br>")}</td></tr>
        </table>
      </div>
    `;

    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: ownerSubject,
      htmlBody: ownerHtml,
      replyTo: email
    });

    // Auto-reply to sender
    const replySubject = "We received your message";
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; color: #1f2a2a; line-height: 1.6;">
        <div style="margin-bottom: 16px;">
          <img src="${LOGO_URL}" alt="Grad Germany" style="max-width: 140px; height: auto;" />
        </div>
        <p>Hi ${safeName},</p>
        <p>Thank you for reaching out. We have received your message and will respond within 24 hours.</p>
        <div style="background: #f6f7f9; padding: 12px 14px; border-radius: 8px;">
          <strong>Your message:</strong><br>
          ${safeMessage.replace(/\n/g, "<br>")}
        </div>
        <p style="margin-top: 16px;">If you have more details to add, just reply to this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e6ea; margin: 18px 0;" />
        <p style="font-size: 12px; color: #6b7280;">
          Follow us: <a href="#" style="color: #6b7280;">LinkedIn</a> · <a href="#" style="color: #6b7280;">Instagram</a>
          <br>
          You are receiving this because you contacted us. If this was a mistake, you can ignore this email.
        </p>
      </div>
    `;

    MailApp.sendEmail({
      to: email,
      subject: replySubject,
      htmlBody: replyHtml
    });

    writeStatus(sheet, row, "Sent");
  } catch (err) {
    console.error(err);
    // Try to log status if possible
    try {
      if (e && e.range) {
        writeStatus(e.range.getSheet(), e.range.getRow(), "Error: " + err.message);
      }
    } catch (innerErr) {
      console.error(innerErr);
    }
  }
}

function getFirst(named, key) {
  const val = named[key];
  return Array.isArray(val) ? val[0] : "";
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRateLimited(email) {
  const props = PropertiesService.getScriptProperties();
  const key = `rate_${email.toLowerCase()}`;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxSubmissions = 3;

  let timestamps = [];
  const raw = props.getProperty(key);
  if (raw) {
    try {
      timestamps = JSON.parse(raw);
    } catch (e) {
      timestamps = [];
    }
  }

  // keep only last 10 minutes
  timestamps = timestamps.filter((t) => now - t < windowMs);
  if (timestamps.length >= maxSubmissions) {
    return true;
  }

  timestamps.push(now);
  props.setProperty(key, JSON.stringify(timestamps));
  return false;
}

function writeStatus(sheet, row, status) {
  const headerRow = 1;
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  let statusCol = headers.indexOf("Status") + 1;

  if (statusCol === 0) {
    statusCol = lastCol + 1;
    sheet.getRange(headerRow, statusCol).setValue("Status");
  }

  sheet.getRange(row, statusCol).setValue(status);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
