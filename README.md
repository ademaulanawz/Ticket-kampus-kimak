# IssueFlow - React + TypeScript Issue Ticketing System with Native SQLite

A modern, full-stack Issue & Ticketing Management system built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, and Node's built-in **native SQLite** engine (`node:sqlite`).

---

## 🌟 Key Features

- **Zero C++ Build Tools Required**: Powered by Node 22/24's built-in native SQLite engine (`node:sqlite`). No `node-gyp`, no Python, no Visual Studio C++ build tools required.
- **Interactive Kanban Board**: Visual columns for `Backlog`, `To Do`, `In Progress`, and `Done` with drag-and-drop or quick status updates.
- **Tabular List View**: Search by keyword and filter by status, priority, issue type, or assignee.
- **Detailed Ticket View & Discussion Thread**: View and update fields inline, manage labels, and add timestamped comments.
- **Metrics Dashboard**: Instant KPI cards showing total issues, in-progress count, urgent alerts, and resolution rate.
- **Full TypeScript**: End-to-end type safety across backend and frontend models.

---

## 📂 Project Structure

```text
Sample/
├── package.json              # Root workspace orchestrator
├── README.md
├── server/                   # Backend API with native SQLite
│   ├── package.json
│   ├── tsconfig.json
│   ├── data/                 # SQLite database file directory (auto-created)
│   └── src/
│       ├── index.ts          # Express server entry point (Port 5000)
│       ├── db.ts             # Native node:sqlite setup, schema & auto-seed
│       ├── seed.ts           # Standalone seed / reset script
│       ├── types.ts          # Backend TypeScript types
│       └── routes/
│           ├── tickets.ts    # /api/tickets CRUD endpoints
│           ├── comments.ts   # /api/tickets/:id/comments endpoints
│           └── stats.ts      # /api/stats analytics endpoints
└── client/                   # Frontend React App
    ├── package.json
    ├── vite.config.ts        # Vite config with /api reverse proxy
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx           # Main application shell
        ├── types.ts          # Frontend TypeScript models
        ├── api.ts            # Client API caller
        └── components/
            ├── Navbar.tsx
            ├── DashboardStats.tsx
            ├── FilterBar.tsx
            ├── KanbanBoard.tsx
            ├── TicketList.tsx
            ├── TicketCard.tsx
            ├── TicketCreateModal.tsx
            └── TicketDetailModal.tsx
```

---

## 🚀 Quick Start Guide

In your PowerShell or Command Prompt terminal in `c:\Users\Galang\Project\Sample`:

### 1. Install Dependencies
```powershell
npm.cmd install
```
*(Or `npm install` in CMD / Git Bash)*

### 2. Start Development Server
```powershell
npm.cmd run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
