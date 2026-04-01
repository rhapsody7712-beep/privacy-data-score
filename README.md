# Privacy Data Score™

> **Discover what your personal data is worth — and take it back.**

Privacy Data Score is a free, instant web tool that analyzes your digital footprint, estimates the market value of your personal data, and shows which data brokers are profiling you — all in under 5 seconds.

---

## What It Does

Most people have no idea that thousands of data brokers are buying and selling their personal information every day. Privacy Data Score makes that visible.

Enter your name and email, and the tool generates:

- **A privacy score** (out of 1000) based on your estimated data exposure
- **A dollar value** of what your personal data profile is worth on the open market
- **A breakdown** across 5 key dimensions: demographic value, behavioral signals, purchase intent, data exposure, and consent control
- **A list of data brokers** that likely have your information
- **AI-generated insights and recommendations** personalized to your score
- **Opt-out request simulation** — see how you'd remove yourself from broker databases
- **PDF export** of your full privacy report

---

## Screenshots

![Landing Page](public/screenshots/home.png)
![Results Page](public/screenshots/results.png)

---

## Why I Built This

Data privacy is invisible to most people — and that invisibility is by design. Brokers profit from information asymmetry. This tool flips that by making your data exposure concrete, quantified, and actionable.

The goal isn't to scare — it's to inform. When people understand that their browsing habits, purchase intent, and demographic profile have a literal dollar value, they start making different choices.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Lucide Icons
- **Charts:** Recharts
- **PDF Generation:** jsPDF
- **AI Insights:** Claude API (Anthropic)

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/rhapsody7712-beep/privacy-data-score.git
cd privacy-data-score

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

1. User enters their name, email, and optional phone number
2. The `/api/score` endpoint calculates a privacy score based on heuristic signals derived from the input (email domain, name patterns, phone presence)
3. The `/api/insights` endpoint uses Claude to generate personalized privacy insights and recommendations based on the score breakdown
4. The results page displays the score, data valuation, broker exposure list, and actionable next steps

> **Note:** Scores are simulated based on typical data broker behavior patterns and are for educational purposes only. No real data broker lookups are performed, and no user data is stored.

---

## Features

| Feature | Status |
|---|---|
| Privacy score (0–1000) | Live |
| Data value estimation | Live |
| Score breakdown (5 dimensions) | Live |
| Data broker exposure list | Live |
| AI insights + recommendations | Live |
| Opt-out request simulation | Live |
| PDF report download | Live |
| Share score link | Live |

---

## Privacy Promise

This tool practices what it preaches. No user data is stored, logged, or sold. The analysis is performed entirely at request time and discarded immediately after. No third-party trackers. No cookies.

---

## License

MIT — free to use, fork, and build on.

---

*Built to raise awareness about the data economy and give people a starting point for reclaiming their digital privacy.*
