# Mini ERP + CRM: Technical Architecture & Workflow

The application is a modern, decoupled **Client-Server Architecture** built entirely in **TypeScript**.

## The Frontend (Client)
* **Tech Stack:** React 18, Vite, Tailwind CSS v4, Lucide React (Icons).
* **Routing:** `react-router-dom` handles Client-Side Routing (SPA), ensuring page transitions are instant without reloading the browser.
* **State Management:** React Context API (`AuthContext`) globally manages the user's logged-in state and securely stores the JWT in `localStorage`.
* **API Communication:** `axios` is used to communicate with the backend. It features an **Interceptor** that automatically intercepts every outgoing request and attaches the JWT `Bearer` token to the Authorization headers so the user doesn't have to re-authenticate for every click.

## The Backend (Server)
* **Tech Stack:** Node.js, Express.js, `tsx` (for executing TypeScript natively).
* **Architecture:** It follows a standard MVC-like pattern (`Routes` -> `Controllers` -> `Database`).
* **Security:** Passwords are never stored in plain text; they are cryptographically hashed using `bcrypt`. Sessions are stateless, managed via `jsonwebtoken` (JWT). Input data from the frontend is strictly validated using `Zod` before touching the database to prevent injection attacks or bad data.

## The Database Layer (Prisma + PostgreSQL)
* **Database:** Hosted on **Neon** (a Serverless PostgreSQL provider), using their high-performance connection pooler.
* **ORM:** **Prisma v7** is used to interact with the database. We use the `@prisma/adapter-pg` driver adapter to ensure compatibility with modern Node environments.
* **ACID Transactions (The Core Logic):** The most complex part of the backend is the Challan confirmation logic. It utilizes Prisma's `$transaction` API. When a Challan is confirmed, the backend opens a database transaction to:
  1. Verify `current_stock` is `> quantity` for every item.
  2. Update the Challan status to `CONFIRMED`.
  3. Decrement the `current_stock` in the `Product` table.
  4. Insert multiple audit records into the `InventoryMovement` table.
  
  *If any of these steps fail (e.g., someone bought the last item a millisecond prior), the entire transaction rolls back, preventing negative inventory bugs.*

## Deployment Readiness
The repository is structured as a Monorepo. 
* The `client` folder is ready to be dragged and dropped into **Vercel** or **Netlify**. 
* The `server` folder is ready to be deployed to **Render**, **Railway**, or **Heroku**, connected securely to the Neon database via the `.env` variables.
