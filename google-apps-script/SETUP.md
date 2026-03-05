# Google Form → Apps Script Setup (Email Automation)

## 1) Create the Google Form + Sheet
1. Create a Google Form with fields: **Name**, **Email**, **Message**, **Challenge**.
2. Set the **Challenge** question (e.g., “What is 3+4?”) and ensure the expected answer is **7**.
3. In the Form, go to **Responses → Link to Sheets** to create a spreadsheet.
4. Verify the response headers are exactly:
   - Timestamp, Name, Email, Message, Challenge

## 2) Add the Apps Script
1. Open the response spreadsheet.
2. Go to **Extensions → Apps Script**.
3. Replace the contents of the script editor with the file:
   - `google-apps-script/Code.gs`
4. Update these constants near the top:
   - `OWNER_EMAIL = "OWNER_EMAIL@gmail.com"`
   - `LOGO_URL = "https://example.com/logo.png"`
5. Save the project.

## 3) Create the trigger
1. In Apps Script, open **Triggers** (left sidebar clock icon).
2. Click **Add Trigger**.
3. Choose function: `onFormSubmit`
4. Event source: **From spreadsheet**
5. Event type: **On form submit**
6. Save and authorize.

## 4) reCAPTCHA note
Google Forms does **not** allow custom reCAPTCHA or Turnstile inside the embedded iframe.
- Spam protection is handled by Google Forms + the **Challenge** question.
- If you need reCAPTCHA/Turnstile, use a **custom form + serverless backend** (Cloudflare Worker/Vercel).

## 5) Quotas + Logs
- Apps Script / Gmail has daily sending limits (quota depends on account type).
- Check quotas in **Apps Script → Project Settings → Quotas**.
- View logs in **Apps Script → Executions**.

## 6) Status tracking
The script writes a **Status** column into the sheet with values like:
- Sent
- Rejected: invalid email
- Rejected: failed challenge
- Rejected: rate limited
- Error: <message>
