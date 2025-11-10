# Fanalytics - Sports Analytics with AI

A comprehensive sports analytics application built with Next.js, featuring AI-powered analysis using Qwen AI with access to live ESPN data and historical Baseball-Reference/Basketball-Reference statistics.

## Features

- **Multi-Sport Coverage**: NFL, NBA, NCAA Football, NCAA Basketball, MLB
- **AI-Powered Analysis**: Qwen AI provides expert sports analysis with tool calling
- **Live Data Integration**: Real-time scores, teams, players, betting odds from ESPN APIs
- **Historical Statistics**: Access to Baseball-Reference and Basketball-Reference data
- **Advanced Comparisons**: Team vs team and player vs player analysis
- **Searchable Player Selection**: Find players quickly with searchable dropdowns
- **Responsive Design**: Modern UI built with Shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI
- **AI Integration**: Nebius AI (Qwen model) with tool calling
- **Data Sources**: ESPN APIs, Baseball-Reference, Basketball-Reference
- **Deployment**: Vercel

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

### Environment Variables

Create a `.env.local` file with your API keys:

```env
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_BASE_URL=https://api.nebius.com/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Python Dependencies (for Sports Reference scraping)

If you want to use Baseball-Reference and Basketball-Reference data:

```bash
cd scripts
pip install -r requirements.txt
```

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## AI Integration

### Qwen AI with Tool Calling

The app uses Qwen AI (via Nebius) with advanced tool calling capabilities to provide expert sports analysis. The AI can access:

- **Live ESPN Data**: Current season statistics, recent games, league standings
- **Historical Data**: Baseball-Reference and Basketball-Reference statistics
- **Real-time Analysis**: Up-to-date player and team performance data

### Available Tools

- `get_team_stats` - Current season team statistics
- `get_player_stats` - Individual player information
- `get_recent_games` - Recent game results
- `get_league_standings` - Current league rankings
- `get_baseball_reference_stats` - Historical baseball statistics
- `get_basketball_reference_stats` - Historical basketball statistics

### Sports Reference Integration

The app integrates with Baseball-Reference.com and Basketball-Reference.com to provide historical context:

#### Baseball Data Types:
- **Batting**: Hitting statistics and leaders
- **Pitching**: Pitching performance data
- **Fielding**: Defensive statistics

#### Basketball Data Types:
- **Per Game**: Per-game averages
- **Totals**: Season totals
- **Advanced**: Advanced analytics (PER, true shooting, etc.)
- **Standings**: Historical league standings

#### Usage Examples:

```python
# Scrape 2023 MLB batting leaders
python scripts/scrape_sports_refs.py --sport baseball --year 2023 --stat-type batting

# Scrape 2023 NBA per-game stats
python scripts/scrape_sports_refs.py --sport basketball --year 2023 --stat-type per_game

# Format data for Qwen AI
python scripts/scrape_sports_refs.py --sport baseball --year 2023 --stat-type batting --qwen-format
```

The AI automatically calls these tools during analysis to provide context-rich comparisons.

## API Endpoints

- `GET /api/sports-reference` - Test sports reference API
- `POST /api/sports-reference` - Fetch historical sports data

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
