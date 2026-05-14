# Compliance Metrics Dashboard

A professional, live compliance KPI dashboard visualizing mock GRC (Governance, Risk, and Compliance) metrics. This project demonstrates the ability to translate technical compliance requirements into a high-performance, security-hardened data visualization tool.

## 🚀 Features
- **Security-First Architecture**: Features a password-protected access gate with timing-attack prevention.
- **Enterprise KPIs**: Real-time visualization of Open Risks, Control Pass Rates, Overdue Findings, and Critical Vendors.
- **Advanced Data Viz**: 
  - Risk Heatmap (Impact vs. Likelihood)
  - Audit Findings Trends (12-month cycle)
  - Control performance across NIST CSF 2.0, SOC 2, and ISO 27001.
- **Data Integrity**: 100% synthetic mock data with automated CSV injection sanitization on all text outputs.
- **Interactive Registry**: Filterable findings log with one-click secure CSV export.

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (v4)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## ⚙️ Local Installation

Follow these steps to set up the dashboard on your local machine:

### 1. Prerequisites
- **Node.js**: Version 18.0 or higher.
- **Package Manager**: npm (comes with Node) or pnpm.

### 2. Clone & Install
```bash
git clone https://github.com/your-username/compliance-metrics-dashboard.git
cd compliance-metrics-dashboard
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory by copying the example:
```bash
cp .env.example .env
```
Edit the `.env` file and set a password for the dashboard:
```env
VITE_APP_PASSWORD="your-chosen-password"
```

### 4. Launch Development Server
```bash
npm run dev
```
The app will open at `http://localhost:3000`.

### 5. Production Build
To generate a production-ready bundle:
```bash
npm run build
```

## 🔒 Security Hardening
- **HMAC-Safe Auth**: Password comparison designed to prevent timing attacks.
- **Input Sanitization**: Replaces leading characters (`=`, `+`, `-`, `@`) in data to prevent formula injection in spreadsheet exports.
- **X-Frame-Options**: Configured to prevent clickjacking in production environments.
- **Structured Rendering**: Uses structured dataframes only; no raw HTML injection risks.

## 📊 Mock Data
All data is synthetically generated to simulate a real-world GRC environment across 80 risks, 120 controls, and 60 findings. No real organizational data is used.

---
*MVP Blueprint Project*
