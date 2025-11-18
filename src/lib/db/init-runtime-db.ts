import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * For Netlify deployment: Copy the pre-built database to /tmp
 * This allows SQLite to work properly since it needs a writable filesystem
 */
export function initRuntimeDatabase() {
  // Only run this in production (Netlify)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Skipping runtime DB init - not in production');
    return;
  }

  console.log('Initializing runtime database...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Current DATABASE_URL:', process.env.DATABASE_URL);
  console.log('CWD:', process.cwd());

  const targetDir = '/tmp/prisma';
  const targetDb = join(targetDir, 'dev.db');

  // Check if we've already copied the database
  if (existsSync(targetDb)) {
    console.log('Database already initialized in /tmp');
    process.env.DATABASE_URL = `file:${targetDb}`;
    return;
  }

  // Try multiple possible source locations
  const possibleSources = [
    join(process.cwd(), 'prisma', 'dev.db'),
    join(process.cwd(), 'prisma', 'prisma', 'dev.db'),
    '/var/task/prisma/dev.db',
  ];

  console.log('Searching for database in:', possibleSources);

  let sourceDb: string | null = null;
  for (const path of possibleSources) {
    console.log(`Checking ${path}:`, existsSync(path));
    if (existsSync(path)) {
      sourceDb = path;
      console.log('Found database at:', path);
      break;
    }
  }

  if (!sourceDb) {
    console.error('Source database not found in any of these locations:', possibleSources);
    console.error('Directory listing of process.cwd():', process.cwd());
    try {
      const fs = require('fs');
      console.error('Contents:', fs.readdirSync(process.cwd()));
    } catch (e) {
      console.error('Could not list directory:', e);
    }
    return;
  }

  try {
    // Create /tmp/prisma directory
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
      console.log('Created directory:', targetDir);
    }

    // Copy the database file
    copyFileSync(sourceDb, targetDb);
    console.log('Database copied from', sourceDb, 'to', targetDb);

    // Update the DATABASE_URL environment variable
    process.env.DATABASE_URL = `file:${targetDb}`;
    console.log('Updated DATABASE_URL to:', process.env.DATABASE_URL);
  } catch (error) {
    console.error('Error initializing runtime database:', error);
  }
}
