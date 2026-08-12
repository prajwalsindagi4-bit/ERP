Mini ERP + CRM System

This repository contains the source code for the Mini ERP + CRM System.

Local Setup Instructions

Follow these steps to run the application locally on your machine.

1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** database (Local or Cloud-hosted like Neon/Supabase)

 2. Backend Setup (`/server`)
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and configure the following variables:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_secure_random_string"
   CLIENT_URL="http://localhost:5173"
   ```
4. Generate the Prisma Client and run database migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Seed the database with test roles and data:
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```

 3. Frontend Setup (`/client`)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.


-------------------------------------------------------------------------------------------------------------

 Cloud Deployment Instructions

 1. Database (Neon / Supabase)
1. Create a PostgreSQL project on Neon.tech.
2. Copy the Connection String (DATABASE_URL).

 2. Backend Deployment (Render)
1. Connect your GitHub repository to Render and create a **Web Service**.
2. Configure the service:
   - **Root Directory**: `server`
   - **Language**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
3. Add the Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`).
4. Click Deploy.

 3. Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel.
2. Configure the project:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
3. Add the Environment Variable:
   - `VITE_API_URL` (Set this to your live Render API URL, e.g., `https://your-backend.onrender.com/api`)
4. Click Deploy.
