import 'dotenv/config';
import prisma from './src/config/db';

async function run() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    console.log("USER:", user);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

run();
