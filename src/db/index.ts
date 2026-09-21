import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connectionString,
});

export const initDB = async () => {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS devpulse;

    CREATE TABLE IF NOT EXISTS devpulse.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'contributor'
        CHECK (role IN ('contributor', 'maintainer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS devpulse.issues (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL CHECK (char_length(description) >= 20),
      type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved')),
      reporter_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION devpulse.set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS users_set_updated_at ON devpulse.users;
    CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON devpulse.users
      FOR EACH ROW EXECUTE FUNCTION devpulse.set_updated_at();

    DROP TRIGGER IF EXISTS issues_set_updated_at ON devpulse.issues;
    CREATE TRIGGER issues_set_updated_at
      BEFORE UPDATE ON devpulse.issues
      FOR EACH ROW EXECUTE FUNCTION devpulse.set_updated_at();
  `);
};
