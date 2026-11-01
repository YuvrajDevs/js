# js — job seek engine

Finds AI-native builder roles (founding / product / AI engineer, "ship fast with AI"), scores them against your profile, tailors your resume per job (no fabrication), and prefills the application. **You review and press submit.**

## Pipeline
`scan` (Greenhouse/Lever/Ashby public APIs + HN Who's Hiring + RemoteOK) → keyword prefilter → `rank` (Claude scores 0-100 with a reason) → `list` → `tailor <id>` (resume + cover note in `out/`) → `apply <id>` (Playwright prefill, stops before submit).

## Setup
```
npm i && npx playwright install chromium
cp profile/profile.example.yml profile/profile.yml   # fill in truthfully
export ANTHROPIC_API_KEY=...
npm run scan && npm run rank && npm run list
npm run tailor -- gh:anthropic:12345
```

## Design rules
- Tailoring may only reorder/reword facts from `profile.yml`. Never invent.
- No auto-submit: avoids bans and bad applications. Quality of 5 applications a day beats 100 spam.
- LinkedIn/Naukri scraping is deliberately excluded (ToS, bans). Use ATS APIs and communities instead.

## Roadmap
1. PDF export of the tailored resume (Playwright `page.pdf`).
2. Cold-email/DM drafts to the founder or hiring manager (highest-converting channel for these roles).
3. Daily cron + digest (Telegram/email) of top 5 jobs.
4. More sources: YC Work at a Startup, Wellfound, X/Twitter "hiring" posts, company career pages via sitemap.
5. Application tracker + follow-up reminders.

## International mode
Set `international` in `profile.yml`. Non-English postings (Japanese etc.) are translated to English, and Claude extracts required language, visa sponsorship, relocation support and salary (converted to INR/month). **Any role requiring the local language is dropped.** `list` shows country, ₹/month, VISA and RELO tags.
Visa reality check: Japan's work visa generally needs a bachelor's degree or ~10 years' experience; Germany's Blue Card needs a degree and a salary threshold. Check eligibility before investing in an application.
Sources are UNVERIFIED from the build sandbox (outbound web was blocked); test each URL on your machine.
