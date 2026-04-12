# 🛡️ Cybersec Attack Simulator

A fully interactive, visually stunning, **full-stack web vulnerability sandbox**. This platform is designed to teach offensive and defensive security concepts safely by directly executing sophisticated exploit logic against isolated Node.js API endpoints backed by a Prisma + SQLite database structure.

![Dashboard Preview](https://via.placeholder.com/1200x600/050a10/00ff88?text=Cybersec+Simulator)

## 🌟 Key Features

1. **True API Exploits**: Unlike traditional browser-only sandboxes, this simulator ships with real `Next.js API Route Handlers` and a connected `SQLite` database. When you run an SQL injection, it legitimately parses un-escaped SQL concatenation using Prisma's `$queryRawUnsafe()`. 
2. **8 Interactive Labs**:
   - **XSS** (Reflected & Stored payloads impacting DOM states)
   - **SQL Injection** (UNION based and destructive database query dumping)
   - **CSRF** (Forged session-aware payloads mapped to backend REST logic)
   - **Broken Authentication** (Bypassing JWT signatures via `alg: none` and Cookie manipulation)
   - **File Upload** (Validating weak MIME type defenses allowing RCE Webshells)
   - **SSRF** (Executing proxy `fetch()` sequences pulling internal mock EC2 configurations)
   - **Command Injection** (Bypassing input sanitization)
   - **IDOR** (Exposing sequential integer database referencing)
3. **The Matrix "Visualizer"**: A complex, animated SVG ecosystem that visually plots the chronological transfer of your exploited data from the `Attacker` -> `WebApp` -> `Database` -> `Victim` in real-time.
4. **Gamification Ecosystem**: Powered by `Zustand` and `LocalStorage` to track total attacks, XP generation, earned medals, and dynamically unlock ascending "Hacker Ranks".
5. **Real-Time Multiplayer Combat**: A fully functional Node.js `socket.io` backend orchestrating live "Attacker vs Defender" match-making rooms!

---

## 🛠️ Tech Stack Integration

### Frontend
- **Next.js 14** (App Router)
- **React 19**
- **Zustand** (Persistent State Store)
- **Tailwind CSS v4** (Dark Aesthetic Design System)
- **D3-Inspired SVG** (Attack Flow Timelines)
- **Socket.io-client** (Real-Time UI sync)
- **xterm.js** (Terminal emulation layer)

### Backend ecosystem
- **Next.js API Handler Boundary** (`app/api/labs/...`)
- **Prisma ORM** (Database interfacing mapping mock vulnerabilities)
- **Express + Socket.io Server** (Live orchestration on port 3001)

---

## 🚀 Installation & Local Development

This application operates out of a standard `src/` directory.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure the Vulnerable Database
Set up the Prisma engine and populate the database with susceptible targets.
```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### 3. Launch the Simulator
We use `concurrently` to dynamically spin up both the primary UI/API Next.js server AND the backend WebSockets node server with a single command:

```bash
npm run dev
```

Navigate to **[http://localhost:3000](http://localhost:3000)** to enter the dashboard.

---

## ⚠️ Disclaimer
This tool is strictly designed for educational purposes. It intentionally bypasses modern web framework security boundaries on its API endpoints (e.g., using RAW un-escaped concatenation for databases and accepting unsanitized POST structures) to recreate vulnerabilities safely within the SQLite isolated structure. **Never deploy these API patterns to a production application.**
