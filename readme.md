# Kuvaku Assignment — Setup Guide

This document explains how to set up the project locally. Replace placeholder values (UPPERCASE) with project-specific values when needed.

## Prerequisites
- Git
- Node.js >= 16.x (or specify project Node version) and npm/yarn, OR
- Docker & Docker Compose (optional, not working)
- A database if required (Postgres)

## Clone the repository
```bash
git https://github.com/i5hwar-ka1m39h/lead_scorer.git
cd lead_scorer
```

## Environment
Create a copy of the example environment file and edit values:
```bash
cp .env.example .env
# Edit .env to set secrets, DB connection, API keys, etc.
```

Common variables:
- PORT=3000
- DATABASE_URL=postgres://user:pass@localhost:5432/dbname
- GEMINI_API_KEY

- 

## Install dependencies

Node.js (JavaScript/TypeScript) project:
```bash
# npm
npm install

```



## Database setup 
Example for a Postgres DB with migrations:
```bash
npx prisma migrate deploy
```


## Run (development)
Node:
```bash
npm run dev        # or npm run build && npm run start
```

```

Docker (not working):
```bash
docker-compose up --build
```

## Api usage 
You can check out the api docs at : https://lead-scorer-0l9n.onrender.com/docs

## Score logic
All the rule score are located in src/lib/scorer.ts
currently only having these roles const decisionMakerRoles = [
  "founder",
  "cofounder",
  "ceo",
  "chief",
  "head",
  "director",
  "vp",
  "vice president",
  "owner",
];

const influencerRoles = [
  "manager",
  "lead",
  "specialist",
  "consultant",
  "executive",
  "supervisor",
];

You can check out the ai logic in src/lib/aiScores.ts
But Gemini api is prone to error because of model overloading.
