# Portfolio expectations for junior AI-native builders (2025-2026)

Method note: 7 WebSearch calls (snippet summaries only) and 1 WebFetch (failed: chbigelow.com blocked). No page was read in full. Almost everything below is "snippet only" and comes from practitioner/career blogs, prep sites and Reddit mirrors, not from named hiring managers. HN Who's Hiring threads, X/Twitter and Indie Hackers were not reached. Treat as opinion, not data.

## What do hiring managers/founders say they want to see?

### Takeaway
Consistent (but low-authority) message: shipped, deployed work you can explain in depth beats many tutorial projects; judgment over AI output and the ability to explain your code are the main filters. No first-party hiring-manager quotes were obtained.

### Cited Findings
- (snippet only) Hiring managers reportedly ask for GitHub/live demo links before the CV; 3-4 deeply documented projects beat a dozen; eval suite with results table in README called "#1 portfolio signal" (single unverified source); merged PRs to known AI projects cited as validation; show prompt choices, review process, what you owned vs delegated. Kaggle/tutorial clones "look like everyone else's" — [Search roundup of letsdatascience / dataexpert / dev.to guides](https://letsdatascience.com/blog/the-ml-portfolio-that-actually-gets-you-hired-in-2026), [dataexpert guide, Mar 2026](https://www.dataexpert.io/blog/ultimate-guide-ai-engineering-portfolios), [dev.to proof-of-work portfolio](https://dev.to/rishi_kora/show-your-work-the-ai-engineer-proof-of-work-portfolio-2f2k)
- (snippet only) AI-native teams want shipped work visible before the first conversation; "a candidate from a no-name school with shipped AI work beats a Stanford candidate without it"; strongest signal is having watched customers use the product and shaped it accordingly; job posts ask for "a link to something you've shipped"; wants builders who "use AI without accepting weak output" — [theaimarketpulse](https://theaimarketpulse-com.pages.dev/insights/what-ai-native-companies-want-2026/), [AI-native developer on job postings (Substack)](https://arslandg.substack.com/p/what-ai-native-developer-actually), [provn.co, Jun 2026](https://provn.co/blog/2026/06/get-hired-early-career-builder)
- (snippet only) Reddit (via mirror) commenters: "if you cannot explain the code, it's vibe-coded"; hiring managers probe debugging without AI, performance reasoning, explaining decisions; not using AI can be a red flag; others don't care if vibe-coded if it works and is documented; explaining what AI did vs what you changed is more credible than hiding it — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1qe960j/snapshots/2026-01-16T20%3A50%3A45.135165Z) and other mirror snapshots in the same search
- (snippet only) Skeptic view: side projects are noise unless used by many people; one recruiter skim is under 30 seconds — [Reddit mirror search](https://reddit.sentinel-team.org/posts/1ps4yet/snapshots/2025-12-26T18%3A31%3A31.46825Z), [freeCodeCamp thread (older, pre-2025)](https://forum.freecodecamp.org/t/why-would-someone-hire-a-junior-developer/489378)
- (snippet only) BairesDev survey of 1,569 devs: juniors who landed jobs say own projects/portfolio helped significantly — [BairesDev Dev Barometer Q2 2026](https://bairesdev.com/files/Dev_Barometer_Q2_2026_Data_Deck.pdf)
- (snippet only) Context: one survey says 75% of founders now prioritise experienced over junior hires — [CFOtech](https://cfotech.co.uk/story/ai-drives-hiring-shift-to-senior-devs-at-eu-startups); unverified stat of 73% YoY drop in junior hiring from a secondary European source — [algeriatech.news](https://algeriatech.news/ai-skills-entry-level-jobs-tripled-demand-career-pivot-2026/)

### Inferences
- Explainability/ownership of AI-generated code is the recurring filter; AI use itself is not penalized.
- Market is tighter for juniors, so proof of shipping matters more.

### Gaps
- No HN, X/Twitter, Indie Hackers, or named founder/hiring-manager primary sources reached. Claims about "real users", cost/latency metrics, observability, MCP servers and open-source traction as hiring signals were not supported by any source found (only eval and merged-PR claims appeared).

## Which project categories are saturated vs under-supplied?

### Takeaway
Generic chatbot/basic RAG demos are called undifferentiating; recommended differentiation is evals, tool-using agents, and full-stack products with auth and a real use case. No source gave real demand-gap data.

### Cited Findings
- (snippet only) "Building another basic chatbot probably won't differentiate your portfolio"; strongest projects pair a real user problem with code, document context and evaluation; suggested minimum: RAG app, tool-using agent, full-stack AI product with auth — [datatalks.club](https://datatalks.club/podwiki/wiki/rag-portfolio-projects/), [Coderhouse](https://www.coderhouse.com/articles/ai-engineer-portfolio-projects-llm-apps), [dev.to klement_gunndu](https://dev.to/klement_gunndu/5-ai-portfolio-projects-that-actually-get-you-hired-in-2026-5bpl)
- (snippet only) Suggestions to go beyond plain semantic search (multi-document RAG, knowledge-graph RAG with provenance) — same datatalks.club source
- (snippet only) Advice to build things "painful without AI but possible with it" and deploy live — [questera.ai, Apr 2026](https://questera.ai/blogs/10-vibe-coding-projects-recruiters-actually-notice) (vendor blog)

### Inferences
- Saturation claims are consistent but unquantified; "under-supplied" categories are not evidenced.

### Gaps
- No data on demand gaps; no evidence on MCP-server or agent-tool projects specifically.

## What do AI-native companies (Lovable, Replit, agencies) say about hiring bar and take-homes?

### Takeaway
Replit publishes a process with take-home/walkthrough; third-party guides say it values end-to-end shipping and AI-tool fluency. Lovable evidence is minimal.

### Cited Findings
- (snippet only) Replit jobs page lists recruiter chat, hiring-manager round (live or take-home exercise, or project walkthrough), virtual onsite — [Replit jobs](https://repl.it/jobs); first-party but only via snippet
- (snippet only) Third-party: take-home ~4-8 hrs built and deployed in Replit, judged on product judgment, code quality, tradeoff writeup; favors generalists who ship end to end — [techinterview.org Replit](https://www.techinterview.org/post/3233476795/what-the-replit-interview-actually-tests/), [interviewcoder.co, May 2026](https://www.interviewcoder.co/blog/replit-software-engineer-interview)
- (snippet only) Lovable: first conversation usually with a founder, "does not feel like an interview" — [techinterview.org Lovable](https://www.techinterview.org/post/3233477366/what-interviewing-at-lovable-looks-like/?format=md) (third-party)
- (snippet only) AI-engineer take-homes are scoped briefs (retrieval system, eval harness) delivered as repo + README; take-home often the deciding stage — [dev.to take-home](https://dev.to/rishi_kora/the-ai-engineer-take-home-how-to-ship-a-project-that-gets-you-hired-295e), [dev.to what teams score](https://dev.to/rishi_kora/ace-the-ai-engineer-take-home-what-2026-hiring-teams-score-1j6k)

### Inferences
- Take-homes mirror portfolio signals: deployed, documented tradeoffs, evals.

### Gaps
- No first-party Lovable or Cursor-adjacent hiring statements; "Hiring AI-First Engineers" (chbigelow.com, found via HN mirror) could not be fetched (domain blocked in sandbox). Dates for several sources unknown.
