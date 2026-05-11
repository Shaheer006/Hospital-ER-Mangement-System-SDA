# 🏥 Medicare: Hospital ER Triage Management System

A full-stack, N-Tier architecture application designed to handle the high-stakes logistics of a hospital Emergency Room. This project represents a complete refactoring of a legacy monolithic script into a scalable, type-safe, and persistent management system using modern software design patterns.

## ✨ Key Features
* **Automated Patient Admissions:** Streamlined intake process with strict triage level enforcement.
* **Real-Time ER Floor Management:** Live dashboard tracking bed occupancy and instant "Code Blue" emergency broadcasts.
* **Dynamic Itemized Billing:** Automated billing calculation combining base room rates with active medical equipment costs.
* **One-Click Discharge:** Complex multi-step turnover (clearing beds, logging archives, finalizing bills) handled in a single click.

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** SQLite
* **Architecture:** N-Tier (Client-Server, MVC)

## 🧩 Software Design Patterns Implemented
To ensure strict adherence to SOLID principles, this system implements the following patterns:
1. **Builder:** Safely constructs complex `Patient` objects during admissions.
2. **Facade:** Simplifies the massive 50-line workflows for "Express Admit" and "Discharge" into single command executions.
3. **Decorator:** Dynamically calculates flexible, itemized patient billing.
4. **Adapter (via Repository):** Safely translates raw SQLite text strings into native JavaScript arrays.
5. **Observer:** Broadcasts real-time UI alerts (like Code Blue) across the dashboard without database polling.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Setup

1. **Clone the repository:**
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name

2. **Install Frontend Dependencies:**
    *(Run this in the root project directory)*
    npm install

3. **Start the Backend Server (Terminal 1):**
    *(Navigate to your backend folder and start the Express server)*
    cd backend    # (Or cd server, depending on your exact folder name)
    node server.js

4. **Start the Frontend Client (Terminal 2):**
    *(Open a new terminal, ensure you are in the root directory)*
    npm run dev

5. **Open the Application:**
    Navigate to created local host in your browser.

## 👥 Team
* Shaheer Ahmed Qaiser (501053)
* Syed Abdul Momin Bukhari (501993)
* Syed M. Ahmad Masroor (509847)
* Abdul Rehman (501174)
