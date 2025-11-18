const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// For demo purposes, we'll create the DB in the prisma directory during build
// This will be bundled with the deployment
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const dbDir = path.dirname(dbPath);

// Ensure the prisma directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Set the DATABASE_URL to the absolute path for build time
process.env.DATABASE_URL = `file:${dbPath}`;

console.log('Initializing database for Netlify deployment...');
console.log('Database path:', dbPath);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

try {
  // Generate Prisma Client
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push the database schema
  console.log('Pushing database schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  // Seed the database
  console.log('Seeding database...');
  execSync('npm run db:seed', { stdio: 'inherit' });

  console.log('Database initialized successfully!');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}
