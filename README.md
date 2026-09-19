# ContractMind AI — Construction Contract Intelligence & Correspondence Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)

An enterprise-grade **Contract Intelligence & Claims Correspondence Assistant** purpose-built for Project Managers, Contract Directors, Commercial Managers, and Planning Engineers on complex multi-volume construction and infrastructure projects.

Unlike simple PDF chatbot wrappers, ContractMind AI reasons through the **entire contractual hierarchy and governing legal order-of-precedence** (Priority 1: Signed Contract &rarr; Priority 2: Order of Precedence &rarr; Priority 3: Contemporaneous Project Records &rarr; Priority 4: Governing Law &rarr; Priority 5: Industry Best Practice).

---

## 🌟 Key Capabilities

### 1. 5-Tier Contract Hierarchy Priority Engine
* **Priority 1 — Actual Signed Contract:** Executed Articles of Agreement, Particular Conditions (Part A & B), General Conditions (FIDIC Red/Yellow/Silver 2017, NEC4, JCT), Employer's Requirements, Specifications, Drawings, and Priced BOQ.
* **Priority 2 — Order of Precedence Engine:** Configurable governing hierarchy (Sub-Clause 1.5) resolving ambiguities and conflicts between documents.
* **Priority 3 — Contemporaneous Project Records:** Daily Progress Reports (DPRs), joint survey protocols, RFI history, approved Primavera P6 schedules, and formal notices under Sub-Clause 20.2.
* **Priority 4 — Governing Statutory Law & Regulations:** National contract statutes, electrical grid safety clearance regulations, labor laws.
* **Priority 5 — Construction Industry Practice:** Clearly labeled as recommended commercial strategy, never confused with a contractual mandate.

### 2. Signature 7-Step Letter Review Studio
Addresses the critical real-world problem of receiving an aggressive letter from the PMC/Client (e.g. alleging contractor default and directing uncompensated 24/7 acceleration):
1. **Step 1 (Extract & Risk Signals):** Auto-extracts sender, ref, date, allegations of default, instructions, and financial/time traps.
2. **Step 2 (Contract Cross-Check):** Verifies statements against contract clauses (*Contractually Supported*, *Partially Supported*, *Not Supported*, *Contradictory*, *Contract Silent*).
3. **Step 3 (Implication Analysis):** Evaluates multi-dimensional exposure across Cost, Delay, LDs ($38.5k/day), Default Liability, and Precedent risk.
4. **Step 4 ("DO NOT SAY" Guardrails):** Detects and prevents casual admissions (e.g. *"we accept the delay"*, *"due to our negligence"*) and provides contractually safe alternatives with express reservations of rights.
5. **Step 5 (Site Questionnaire):** Collects ground-truth engineering facts (utility de-energization dates, crane permits, contemporary DPRs).
6. **Step 6 (Clause Response Matrix):** Tabular rebuttal matrix before correspondence generation.
7. **Step 7 (Contractual Reply Generator):** Generates formal construction correspondence with tone presets (*Firm Contractual, Strong Defense, Diplomatic, Senior Management, Dispute-Prepared*), available in **Official Corporate Letterhead View** or text editor.

### 3. Contract Early Warning & Notice Time-Bar Engine
* **Sub-Clause 20.2 28-Day Watchdog:** Real-time countdowns tracking mandatory notice time-bars to prevent claim forfeiture.
* **Mandatory Contemporary Records:** Automated evidence checklists for delay and variation notices.

### 4. AI Contract Chat with 6 Reasoning Modes
* **Quick Answer:** Rapid clause lookup and summary.
* **Detailed Analysis:** Multi-volume synthesis across Particular and General Conditions.
* **Contractor Defence:** Strategic shielding of commercial position and preservation of EOT entitlements.
* **Employer/PMC Perspective:** Anticipating counter-arguments and audit objections.
* **Claim Preparation:** Clause basis, time-bars, and contemporary records checklist.
* **Dispute Preparation:** Chronological evidentiary briefs for DAAB or arbitration.
* **Strict Hallucination Protection:** Exact citations (*Volume &rarr; Clause &rarr; Page*) and clear separation of contractual rights from industry practice.

### 5. Multi-Volume Explorer, Precedence Conflicts & Document Diff
* **Hierarchy Explorer:** Interactive multi-volume document browser and interconnected clause knowledge graph (*e.g., Cl. 8.4 EOT &harr; Cl. 8.5 Delay &harr; Cl. 13.3 Variations &harr; Cl. 20.2 Claims*).
* **Precedence Conflict Detector:** Evaluates discrepancies (e.g., Particular Condition PC 8.7 10% LD cap vs. General Condition 15% cap) and determines the winner under Clause 1.5.
* **Document Comparison:** Textual diff highlighting additions, deletions, and contractual significance.
* **Executive Reports Center:** Printable formal briefs for board and project director review.

---

## 🔒 100% Local Storage & On-Premise Execution
* **Zero Cloud Leakage:** All PDFs, BOQs, drawings, and correspondence remain on your local disk.
* **Local Ingestion:** Text parsing, vector embeddings, and search indexing are processed on-device with zero telemetry.
* **Progressive Tiered Ingestion:** Volume 1 (Particular & General Conditions) is ready in **15 seconds**, allowing immediate querying while larger drawings index in the background.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) v18+ (tested on v24.12.0)
* npm v9+

### Installation
```bash
# Clone the repository
git clone https://github.com/dinaypatil-web/contract-intel-assistant.git

# Navigate to project folder
cd contract-intel-assistant

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🛠️ Technology Stack
* **Frontend:** React 19, TypeScript, Vite
* **Design System:** Custom Luxury Glassmorphism CSS Design System with Outfit & Plus Jakarta Sans typography
* **Icons:** Lucide React
* **Effects:** Canvas Confetti

---

## 📄 License
This project is licensed under the MIT License.
