import { neon } from '@neondatabase/serverless';

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_UWSMcQJ6OD2t@ep-cold-salad-b5lwuxik-pooler.c-7.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
  );
}

/**
 * Returns a configured Neon serverless SQL query function.
 */
export const sql = (strings, ...values) => {
  const query = neon(getDatabaseUrl());
  return query(strings, ...values);
};

export const getDb = () => neon(getDatabaseUrl());
