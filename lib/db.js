import { neon } from '@neondatabase/serverless';

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return url;
}

/**
 * Returns a configured Neon serverless SQL query function.
 */
export const sql = (strings, ...values) => {
  const query = neon(getDatabaseUrl());
  return query(strings, ...values);
};

export const getDb = () => neon(getDatabaseUrl());
