# Mini ERP + CRM System

A full-stack, enterprise-grade ERP and CRM solution built with React, Node.js, Express, and PostgreSQL (via Prisma).

## 1. Repository & Deployment Links
- **GitHub Repository**: *(Pending push to your GitHub account)*
- **Live Frontend URL**: *(Pending deployment, e.g., Vercel/Netlify)*
- **Live Backend API URL**: *(Pending deployment, e.g., Render/Railway)*

## 2. Test Login Credentials
The database has been seeded with test accounts for each role. The password for all accounts is `password123`.
- **Admin**: `admin@example.com`
- **Sales**: `sales@example.com`
- **Warehouse**: `warehouse@example.com`
- **Accounts**: `accounts@example.com`

## 3. Postman Collection
A Postman collection named `Postman_Collection.json` is included in the root directory. You can import this directly into Postman to test the API routes.

## 4. Setup & Deployment Instructions

### Local Development Setup
1. **Database**: Ensure you have a PostgreSQL database running (or use Neon). Add your connection string to `server/.env` as `DATABASE_URL`.
2. **Backend**:
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Docker Deployment (Production)
The project includes a `docker-compose.yml` for instant deployment.
```bash
# Add your DATABASE_URL and JWT_SECRET to the environment or a .env file, then run:
docker-compose up --build -d
```

## 5. Architecture Overview
Please see the [Architecture Documentation](file:///docs/architecture.md) for a complete breakdown of the stack, frameworks, and database design.
