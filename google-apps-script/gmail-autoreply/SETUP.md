# Gmail Auto-Reply Setup (Time-Driven)

## 1) Create a standalone Apps Script
1. Go to https://script.google.com/ and create a **New project**.
2. Replace the editor contents with:
   - `google-apps-script/gmail-autoreply/Code.gs`
3. Update these constants:
   - `OWNER_EMAIL = "OWNER_EMAIL@gmail.com"`
   - `LOGO_URL = "https://example.com/logo.png"`
4. Save the project.

## 2) Add a time-driven trigger
1. In Apps Script, open **Triggers** (clock icon).
2. Click **Add Trigger**.
3. Choose function: `autoReplyUnread`
4. Event source: **Time-driven**
5. Type: **Minutes timer** → Every 5 minutes (or your choice)
6. Save and authorize.

## 3) How it works
- Looks for unread emails newer than 1 day.
- Skips your own emails and common auto-generated senders (no-reply, mailer-daemon).
- Sends a single reply **per sender per 24 hours**.
- Labels the thread as **AutoReplied** and marks the message as read.

## 4) Avoiding loops
- The script ignores emails from you.
- It ignores no-reply/mailer-daemon type senders.
- It avoids replying to messages whose subject already contains "We received your message".

## 5) Quotas + Logs
- Gmail/Apps Script has daily sending limits.
- Check quotas in **Apps Script → Project Settings → Quotas**.
- See logs in **Apps Script → Executions**.
