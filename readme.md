# Fanalytics - Sports Analytics with AI

A comprehensive sports analytics application built with Next.js, featuring AI-powered insights using Nebius AI (Qwen gpt-oss-120b model) with access to live ESPN data, betting odds, and real-time sports analysis.

## Features

- **Multi-Sport Coverage**: NFL, NBA, NCAA Football, NCAA Basketball, MLB, NHL
- **AI-Powered Insights**: Interactive chatbot using Nebius AI (Qwen gpt-oss-120b) for expert sports analysis
- **Live Data Integration**: Real-time scores, teams, players, and statistics from ESPN APIs
- **Betting Odds**: Current betting lines from The Odds API
- **Player & Team Analysis**: Advanced player comparisons, season stats, and game-by-game analysis
- **User Authentication**: Secure user accounts with Supabase
- **Responsive Design**: Modern UI built with Shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI
- **AI Integration**: Nebius AI (Qwen gpt-oss-120b model) via OpenAI-compatible API
- **Data Sources**: ESPN APIs, The Odds API
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Deployment**: Vercel

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

### Environment Variables

Create a `.env.local` file with your API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Nebius AI Configuration (Optional - hardcoded in code for demo)
NEBIUS_API_KEY=your_nebius_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Installation

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
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

### Using AI Insights

The AI Insights dialog is available on all sports pages. Click the "AI Insights" button to open an interactive chatbot that can help you with:

- **Live Scores**: "Show me today's NFL scores"
- **Player Stats**: "How did Steph Curry perform last game?"
- **Team Analysis**: "Compare the Lakers and Warriors"
- **Betting Odds**: "What are the odds for Sunday's NFL games?"
- **League Leaders**: "Who leads the NBA in points per game?"

The AI responds in plain text format for easy reading and automatically fetches live data using integrated tools.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## AI Integration

### Nebius AI (Qwen gpt-oss-120b)

The app features an interactive AI chatbot powered by Nebius AI using the Qwen gpt-oss-120b model. The AI provides expert sports analysis with access to real-time data through specialized tools.

### AI Chatbot Features

- **Interactive Dialog**: Ask questions about sports scores, player stats, betting odds, and analysis
- **Plain Text Responses**: Clean, readable responses without Markdown formatting
- **Tool Integration**: AI automatically uses tools to fetch live data
- **Multi-Sport Support**: Coverage for NFL, NBA, MLB, NCAA Basketball/Football, NHL

### Available Tools

- `get_scoreboard` - Get live scoreboard for any sport and date
- `get_boxscore_for_team` - Get detailed box score for a specific team game
- `get_player_game_stats` - Get player's stats for a specific game
- `get_player_season_stats` - Get player's season statistics
- `compare_players_nfl` - Compare NFL players' fantasy stats
- `get_odds` - Fetch current betting odds
- `get_league_leaders` - Get top players/leaders for any sport

### Authentication

User authentication is handled through Supabase Auth, providing secure user management with:

- **Email/Password Authentication**: Standard login and registration
- **Session Management**: Secure JWT-based sessions
- **Protected Routes**: Authenticated access to user-specific features
- **User Profiles**: Personalized user accounts

### Data Sources

The AI integrates with multiple data providers for comprehensive sports coverage:

- **ESPN APIs**: Live scores, player stats, team data, box scores
- **The Odds API**: Current betting lines and odds
- **Real-time Updates**: Live game data and statistics

## API Endpoints

- `POST /api/ai-insights` - AI chatbot endpoint for sports analysis
- `POST /api/auth` - Authentication endpoints (login, signup, logout)
- `GET /api/espn` - ESPN data endpoints
- `GET /api/sports-reference` - Sports reference data

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Environment Variables for Vercel

In your Vercel project settings, add these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
