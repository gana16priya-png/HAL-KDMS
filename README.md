# HAL Knowledge & Decision Management System (HKDMS)

Welcome to the **HAL Knowledge & Decision Management System (HKDMS)**. This is an enterprise-grade full-stack platform designed to preserve Hindustan Aeronautics Limited's institutional memory, design decisions, structural issue logs, and regulatory document indexings.

---

## 🏗️ System Architecture

HKDMS is built as a highly decoupled full-stack React and Express.js application. It features robust safety hooks to ensure immediate out-of-the-box runnability with zero setup.

```
+------------------+
|  Browser Client  | <--- Port 3000 (Vite React Client)
+------------------+
         |
         v
+------------------+
|  Express Server  | <--- Port 5000 (Express Node JS)
+------------------+
    /          \
   /            \
  v              v
+---------+    +--------------------------+
| MongoDB |    | Local JSON database      | (Fallback connection)
+---------+    +--------------------------+
```

---

## 🛠️ Fallback Integrations (Demonstration Modes)

1. **Automated Database Fallback**: 
   - The backend attempts to connect to MongoDB.
   - If MongoDB is not running or not configured, the database service (`backend/services/db.js`) automatically initializes a local file-based database (`backend/data/db.json`) containing collections mock data.
   - **No MongoDB setup is required to run the portal!**

2. **Automated AI RAG Fallback**:
   - The AI Assistant chatbot (`backend/services/ai.js`) checks for `OPENAI_API_KEY`.
   - If missing, it uses a local text-parsing algorithm over database items (Decisions, Projects, Issues) to construct answers, complete with interactive references sidebars.
   - **No OpenAI API keys are required to test the chat interface!**

---

## 👥 Role Permissions Matrix

| Module | Administrator | Project Manager | Engineer | Employee |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard Views** | Full Analytics + Logs | Full Analytics | Core | Core |
| **Decision Vault** | Read/Write/Approve | Read/Write/Approve | Read/Write (Pending) | Read Approved Only |
| **Smart Issue Tracker** | Raise / Assign / Close | Raise / Assign / Close | Raise / Update ticket | Raise ticket |
| **Project Milestones** | Edit checklists/details | Edit checklists/details | Read only | Read only |
| **Document Uploads** | Upload / Edit tags | Upload / Edit tags | Upload / Edit tags | Read / Preview only |
| **AI chat assistant** | Yes | Yes | Yes | Yes |
| **Security Audits** | Full access | Forbidden | Forbidden | Forbidden |

---

## ⚡ Setup & Run Instructions

Follow these steps to run the HKDMS frontend and backend servers.

### Prerequisite check (Node.js & npm)
Check if Node.js is installed:
```powershell
node -v
npm -v
```
If Node is not installed, install it using `winget` in PowerShell:
```powershell
winget install OpenJS.NodeJS
```

### Installation Steps

1. **Clone & Open Project Workspace**:
   Navigate into the project directory:
   ```powershell
   cd C:\Users\gana\.gemini\antigravity-ide\scratch\hkdms
   ```

2. **Install Backend Dependencies**:
   ```powershell
   cd backend
   npm install
   ```

3. **Seed the database (Hydrate mock data)**:
   This seeds the database (either MongoDB or `db.json`) with sample users, LCA Tejas programs, flight computers upgrade timeline, engine anomaly issues, and mock pdf files:
   ```powershell
   npm run seed
   ```

4. **Install Frontend Dependencies**:
   ```powershell
   cd ../frontend
   npm install
   ```

### Running the Services

You need to start both backend and frontend servers:

1. **Start Backend Server** (Port 5000):
   ```powershell
   cd backend
   npm start
   ```

2. **Start Frontend Server** (Port 3000):
   ```powershell
   cd frontend
   npm run dev
   ```

Open your browser and navigate to **`http://localhost:3000`** to access the aerospace portal.

---

## 🔑 Fast-Login Demo Credentials

To streamline portal reviews, use the fast-prefill buttons on the Login Gateway, or enter the credentials manually:

* **Administrator**:
  - **Email**: `admin@hal-india.co.in`
  - **Password**: `admin123`
* **Project Manager**:
  - **Email**: `pm@hal-india.co.in`
  - **Password**: `pm123`
* **Engineer**:
  - **Email**: `engineer@hal-india.co.in`
  - **Password**: `eng123`
* **Employee**:
  - **Email**: `employee@hal-india.co.in`
  - **Password**: `emp123`
