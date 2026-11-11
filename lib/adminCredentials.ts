import { getSql } from './db';

const UNDEFINED_TABLE = '42P01';

/**
 * The admin login's password hash, or null while it still uses the shared
 * default password. Also null if migration 005 hasn't been run yet.
 */
export async function getAdminPasswordHash(): Promise<string | null> {
  try {
    const sql = getSql();
    const [row] = await sql<{ password_hash: string | null }[]>`
      SELECT password_hash FROM admin_credentials WHERE id = 'admin'`;
    return row?.password_hash ?? null;
  } catch (error) {
    if ((error as { code?: string }).code === UNDEFINED_TABLE) return null;
    throw error;
  }
}

export async function setAdminPasswordHash(passwordHash: string): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      INSERT INTO admin_credentials (id, password_hash, updated_at) VALUES ('admin', ${passwordHash}, NOW())
      ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`;
  } catch (error) {
    if ((error as { code?: string }).code === UNDEFINED_TABLE) {
      throw new Error('The admin_credentials table is missing — run db/migrations/005_add_admin_credentials.sql in Supabase.');
    }
    throw error;
  }
}
