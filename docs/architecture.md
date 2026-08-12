# Architecture Overview

## 1. Frontend (Client)
- **Framework:** React (bootstrapped with Vite for fast HMR and optimized builds)
- **Styling:** Tailwind CSS (utility-first CSS framework for rapid UI development)
- **Routing:** React Router v6
- **State Management:** React Context API (used primarily for authentication state)
- **Icons:** Lucide-React
- **PDF Generation:** jsPDF & html2canvas

## 2. Backend (Server)
- **Framework:** Node.js with Express.js
- **Language:** TypeScript
- **Validation:** Zod (runtime schema validation for all incoming API requests)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing
- **Security:** 
  - `express-rate-limit` (prevents brute-force and DDoS attacks)
  - `helmet` (secures HTTP headers against common web vulnerabilities like XSS)

## 3. Database
- **Engine:** PostgreSQL
- **ORM:** Prisma
- **Design:** Relational database with strict foreign keys to maintain data integrity between Users, Customers, Products, StockMovements, and Challans.

## 4. Deployment & DevOps
- **Containerization:** Docker & Docker Compose (separate containers for the Node API and the Nginx-served React frontend)
- **CI/CD:** GitHub Actions (automated testing and build verification on push to main branch)
