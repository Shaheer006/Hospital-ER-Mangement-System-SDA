# Hospital ER Management System

A comprehensive Hospital ER Management System built with React, Vite, Tailwind CSS, and SQLite.

## Features

- **Patient Management**: Track patient details, triage levels, and appointments.
- **Bed Management**: Assign patients to beds and manage bed availability.
- **Inventory Management**: Monitor and manage medical equipment and supplies.
- **Billing System**: Automatic billing calculations with decorator support.
- **Data Persistence**: Real-time database synchronization with SQLite.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, SQLite3
- **Architecture**: Facade Pattern, Adapter Pattern, Decorator Pattern

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Hospital-ER-Management-System
   ```

2. Install dependencies:
   ```bash
   cd src
   npm install
   ```

### Backend Setup

1. Open a new terminal and navigate to the backend directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Start the Backend Server

1. In the backend terminal:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001`.

### Start the Frontend Application

1. In the frontend terminal:
   ```bash
   npm run dev
   ```
   The application will open on `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   ├── Patients/
│   ├── Beds/
│   ├── Inventory/
│   ├── Archive/
│   ├── Appointments/
│   ├── Layout/
│   └── shared/
├── lib/
│   ├── api/
│   │   └── Repository.ts  # Database interactions
│   ├── constants.ts       # Configurations and constants
│   ├── utils.ts           # Utility functions
│   └── patterns/          # Design pattern implementations
├── types/
├── App.tsx                # Main application component
├── main.tsx               # Entry point
└── index.html             # HTML template

server/
├── server.js              # Express server
├── database.js            # SQLite database
└── schema.sql             # Database schema
```

## Database

The application uses SQLite for data persistence. The database file `hospital.db` is located in the `server` directory.

## License

[Add license information here]