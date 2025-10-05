import knex, { Knex } from 'knex';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { initialOltDevices, initialOntDevices } from './data/initialData.js';
import { fileURLToPath } from 'url';

// This path resolves to a 'database' directory inside the container, which is mounted as a volume.
// For CommonJS modules, __dirname is a global variable pointing to the directory of the current script.
// In our built server, the script will be in /usr/src/app/dist, so we go up one level.
// FIX: __dirname is not available in ES modules by default. Recreate it using import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDirectory = path.resolve(__dirname, '../database');

// Ensure the database directory exists within the container before trying to connect
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = path.resolve(dbDirectory, 'noorao_gpon_designer.db');

export const db: Knex = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

export async function initializeDatabase() {
  // Users table
  const hasUsersTable = await db.schema.hasTable('users');
  if (!hasUsersTable) {
    await db.schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('email').unique().notNullable();
      table.string('passwordHash').notNullable();
      table.string('role').notNullable();
      table.boolean('verified').defaultTo(false);
    });

    // Seed admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await db('users').insert({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@noorao.designer',
      passwordHash: adminPasswordHash,
      role: 'admin',
      verified: true,
    });
  }

  // Verification codes table
  const hasVerificationCodesTable = await db.schema.hasTable('verification_codes');
  if (!hasVerificationCodesTable) {
    await db.schema.createTable('verification_codes', (table) => {
      table.string('email').primary();
      table.string('code').notNullable();
      table.timestamp('expiresAt').notNullable();
    });
  }

  // OLT Devices table
  const hasOltDevicesTable = await db.schema.hasTable('olts');
  if (!hasOltDevicesTable) {
    await db.schema.createTable('olts', (table) => {
      table.uuid('id').primary();
      table.string('model').notNullable();
      table.text('description');
      table.string('technology').notNullable();
      table.integer('ponPorts').notNullable();
      table.json('uplinkPorts').notNullable();
      table.json('sfpOptions').notNullable();
      table.json('components').notNullable();
    });
    // Seed OLT devices
    await db('olts').insert(initialOltDevices.map(olt => ({
        ...olt,
        uplinkPorts: JSON.stringify(olt.uplinkPorts),
        sfpOptions: JSON.stringify(olt.sfpOptions),
        components: JSON.stringify(olt.components)
    })));
  }

  // ONT Devices table
  const hasOntDevicesTable = await db.schema.hasTable('onts');
  if (!hasOntDevicesTable) {
    await db.schema.createTable('onts', (table) => {
      table.uuid('id').primary();
      table.string('model').notNullable();
      table.text('description');
      table.string('technology').notNullable();
      table.float('rxSensitivity').notNullable();
      table.json('ethernetPorts').notNullable();
      table.integer('fxsPorts').notNullable();
      table.json('wifi');
    });
    // Seed ONT devices
     await db('onts').insert(initialOntDevices.map(ont => ({
        ...ont,
        ethernetPorts: JSON.stringify(ont.ethernetPorts),
        wifi: ont.wifi ? JSON.stringify(ont.wifi) : null
    })));
  }
  
  // Settings table
  const hasSettingsTable = await db.schema.hasTable('settings');
  if(!hasSettingsTable) {
      await db.schema.createTable('settings', (table) => {
          table.string('key').primary();
          table.json('value').notNullable();
      });
  }

  console.log('Database initialized successfully.');
}