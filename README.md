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
Arrangement rule: overseas jobs are kept only if remote AND open to India-based workers (tag REMOTE-IN), or if they offer BOTH visa sponsorship and relocation support. On-site-only roles without both are dropped.
Visa reality check (only matters for the relocation route; remote-from-India needs no visa): Japan's work visa generally needs a bachelor's degree or ~10 years' experience; Germany's Blue Card needs a degree and a salary threshold. Check eligibility before investing in an application.
Sources are UNVERIFIED from the build sandbox (outbound web was blocked); test each URL on your machine.

## Small-company career pages (how remote roles in Japan etc. are usually found)
```
npm run discover -- https://some-startup-directory/japan     # or a text file of domains, one per line
npm run scan        # probes /careers, /jobs, /recruit, 採用 links and ATS embeds (HERP, HRMOS, Wantedly, Lever...)
```
Each company's careers page is hashed; unchanged pages cost nothing on later scans, new postings get translated, filtered (remote-from-India or visa+relocation, no local language) and ranked. Good directory seeds: accelerator portfolios (YC, Antler Japan, etc.), "Japan startup" lists, Product Hunt/Wantedly company lists, X posts like "we're hiring" with a link.

## Web hub (local)
```
npm run web:install && npm run web      # http://localhost:3000
```
Jobs (filter, score, tags), job drawer (tailor resume, copy / save as PDF, cover note, prefill application, set status), Tracker (tailored → applied → interview → offer), Insights (skill demand across your best matches, gaps, project ideas), Profile (edit `profile.yml`). Shows demo data until the first scan. Put `ANTHROPIC_API_KEY=...` in `web/.env.local`.
Prefill opens a real browser window on your machine, so run the hub locally rather than deploying it.
