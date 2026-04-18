import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let dbInstance: Database.Database | null = null;

function getDatabaseFilePath(): string {
  const override = process.env.DATABASE_PATH;
  if (override) return path.resolve(override);
  return path.join(process.cwd(), 'data', 'early-access.db');
}

export function getEarlyAccessDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const filePath = getDatabaseFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  dbInstance = new Database(filePath);
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS early_access_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_early_access_created_at ON early_access_signups(created_at);
  `);

  return dbInstance;
}

export interface EarlyAccessSignupInput {
  email: string;
  name?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function registerEarlyAccess(
  input: EarlyAccessSignupInput
): { ok: true } | { ok: false; code: 'invalid_email' | 'duplicate' } {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) return { ok: false, code: 'invalid_email' };

  const nameRaw = input.name?.trim();
  const name = nameRaw && nameRaw.length > 0 ? nameRaw.slice(0, 200) : null;

  try {
    const stmt = getEarlyAccessDb().prepare(
      'INSERT INTO early_access_signups (email, name) VALUES (?, ?)'
    );
    stmt.run(email, name);
    return { ok: true };
  } catch (e: unknown) {
    if (
      e &&
      typeof e === 'object' &&
      'code' in e &&
      (e as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE'
    ) {
      return { ok: false, code: 'duplicate' };
    }
    throw e;
  }
}
