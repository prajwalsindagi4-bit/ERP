FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install build dependencies for native modules like better-sqlite3
RUN apk add --no-cache python3 make g++
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npx tsc

EXPOSE 5000

CMD ["node", "dist/index.js"]
