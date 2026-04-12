# 🛡️ ZeroDay Lab (v3.5 — "Cyber OS Next")

A state-of-the-art, professional-grade **cybersecurity simulation platform**. ZeroDay Lab (Cyber OS) provides an immersive, windowed environment where users can master real-world attack vectors, visualize network exploits in 3D, and engage in high-stakes "Red vs Blue" training.

## 🌟 Modern Feature Suite

1.  **Cyber OS Desktop**: A high-performance, draggable, multi-windowed workspace designed for complex security operations.
2.  **3D Exploit Visualizer**: Immersive `Three.js` engine that maps data exfiltration, lateral movement, and packet flows across network nodes in real-time.
3.  **Blue Team Defense IDE**: Integrated security audit environment for real-time vulnerability identification, patch development, and deployment.
4.  **Advanced OSINT Engine**: Simulate intelligence gathering with a built-in Dark Web / Onion browser for discovering leaked credentials and target payloads.
5.  **Request Interceptor**: A professional-grade proxy interface to intercept, modify, and replay HTTP requests in transit.
6.  **AI Red-Teamer Bot**: Autonomous AI agents that simulate attacks against your infrastructure to test your defensive capabilities.
7.  **PDF Audit Reporting**: Export industry-standard, technical penetration testing reports featuring CVSS scores and remediation strategies using the integrated `ReportEngine`.
8.  **Multiplayer Arena**: Low-latency WebSocket-driven combat rooms for collaborative red-teaming or competitive "Capture the Flag" (CTF) sessions.
9.  **XP & Ranks**: Earn experience points (XP) to climb from "Script Kiddie" to "Zero Day King" with persistent progress tracking.

## 🚀 Getting Started

ZeroDay Lab is built on the bleeding edge of web technology, utilizing **Next.js 16** and **React 19**.

### 1. Initialize Dependencies
```bash
npm install
```

### 2. Provision Vulnerable Infrastructure
Prepare the database engine and seed the vulnerable target nodes.
```bash
# Sync database schema (Prisma + SQLite)
npx prisma db push

# Seed vulnerable targets and payloads
npx tsx prisma/seed.ts
```

### 3. Launch Cyber OS
Start the integrated Next.js application and the Socket.io multiplayer orchestration server.
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to initiate your session.

## 🛠️ Technology Stack

-   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
-   **3D Visuals**: Three.js (@react-three/fiber + @react-three/drei)
-   **State Orchestration**: Zustand
-   **Real-Time Comms**: Socket.io / WebSockets
-   **Documentation**: jsPDF + AutoTable
-   **Persistence**: Prisma ORM with SQLite
-   **Terminal**: Xterm.js
-   **Animations**: Framer Motion

## ⚠️ Disclaimer
ZeroDay Lab is strictly for **educational and authorized ethical hacking simulator usage**. The platform simulates vulnerable environments to teach security principles. Never attempt to use the payloads or techniques learned here against unauthorized systems.

---
*Built with ❤️ for the Cybersecurity Community.*
