import postgres from 'postgres';

// Singleton reused across warm serverless invocations
let _sql: ReturnType<typeof postgres> | undefined;

export function getSql() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  _sql = postgres(url, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return _sql;
}
