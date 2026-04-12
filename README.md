# 🛡️ ZeroDay Lab (v2.1)

A professional-grade, enterprise-ready **cybersecurity simulation platform**. ZeroDay Lab allows users to safely execute real-world attack vectors against isolated API endpoints, providing deep visibility into vulnerability mechanics through advanced data visualization and real-time multiplayer orchestration.

![Dashboard Preview](https://via.placeholder.com/1200x600/0a0a0a/00ff88?text=ZeroDay+Lab+Dashboard)

## 🌟 Key Features

1.  **High-Fidelity Exploits**: Direct interaction with `Next.js API Routes` and a `Prisma + SQLite` backend. Simulate real SQL Injection (using `$queryRawUnsafe`) and cross-site scripting in a controlled sandbox.
2.  **Attack Flow Visualizer**: A custom SVG engine that plots the chronological path of data transfers between Attacker, Application, Database, and Victim.
3.  **Proctored Labs**: 8 comprehensive scenarios covering XSS, SQLi, CSRF, Broken Auth, File Upload, SSRF, Command Injection, and IDOR.
4.  **Persistent Progress**: Track your evolution from "Script Kiddie" to "Zero Day King" with a persistent XP system and achievment badges.
5.  **Multiplayer Combat**: Compete in live "Attacker vs Defender" rooms powered by a dedicated `Socket.io` orchestration layer.

## 🚀 Setup & Installation

ZeroDay Lab is built with **Next.js 15+** and **Tailwind CSS v4**.

### 1. Bootstrap the Environment
```bash
npm install
```

### 2. Initialize the Vulnerable Graph
Prepare the Prisma engine and seed the vulnerable targets.
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Launch the Platform
Start the integrated Next.js application and the Socket.io multiplayer server.
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to begin your training.

## 🛠️ Technology Stack
- **Framework**: Next.js 15+ (App Router, Turbopack)
- **State Mgmt**: Zustand (with persistent ZeroDay migration logic)
- **Database**: Prisma + SQLite
- **Real-Time**: Socket.io (Multiplayer Orchestration)
- **Styling**: Vanilla CSS + Tailwind v4
- **Iconography**: Lucide React (Enterprise Set)

## ⚠️ Disclaimer
ZeroDay Lab is for **educational purposes only**. The API endpoints intentionally bypass modern security boundaries to demonstrate vulnerabilities. **Do not use these patterns in production.**
