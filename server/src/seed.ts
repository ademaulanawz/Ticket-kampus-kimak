import { db, initDB } from './db.js';

console.log('Resetting and seeding database...');
db.exec(`
  DROP TABLE IF EXISTS comments;
  DROP TABLE IF EXISTS tickets;
`);

initDB();
console.log('Database reset and seeded successfully.');
process.exit(0);

