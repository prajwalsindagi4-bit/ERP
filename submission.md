ERP System - Project Submission

1. GitHub Repository Link
[https://github.com/prajwalsindagi4-bit/ERP](https://github.com/prajwalsindagi4-bit/ERP)

2. Live Frontend URL
*[https://erp-prajwal11.vercel.app/role-selection]*

3. Live Backend API URL
[https://erp-xi0l.onrender.com](https://erp-xi0l.onrender.com)

4. Test Login Credentials
The system has been seeded with the following roles, all utilizing the same default password: **`password123`**
- **Admin**: `admin@example.com`
- **Sales**: `sales@example.com`
- **Warehouse**: `warehouse@example.com`
- **Accounts**: `accounts@example.com`

5. API Documentation
The Postman collection containing all API routes and expected payloads is located in the root of the repository as `postman_collection.json`.

6. Setup and Deployment Instructions
Comprehensive setup and deployment instructions are thoroughly documented in the project's `README.md`.

7. Architecture Overview
The application follows a modern monolithic API + SPA architecture:
- **Frontend (Client)**: Built with React, Vite, and Tailwind CSS. It uses React Router for navigation and React Context for global state management. Hosted on Vercel.
- **Backend (Server)**: A RESTful Node.js/Express API written in TypeScript. It uses Zod for strict runtime request validation and JSON Web Tokens (JWT) for secure authentication. Hosted on Render.
- **Database**: PostgreSQL hosted on Neon, accessed via the Prisma ORM to ensure strong typing and strict relational integrity across users, products, and inventory.

8. Known Limitations & Omissions
1. **AWS S3 Image Upload**: Product images rely on external URLs instead of direct file uploads to avoid requiring external IAM AWS setups.
2. **Email Notifications**: Currently utilizing Ethereal Email (a mock SMTP server) to simulate outgoing emails. Real SMTP credentials are required for production.
3. **Password Reset Flow**: Self-serve password resets via email links are intentionally omitted; account recovery is currently restricted to database administrators to maintain a tighter security perimeter.
