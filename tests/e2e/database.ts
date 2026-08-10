import { randomUUID } from "node:crypto";

import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for authenticated E2E tests.");
}

const databaseHost = new URL(databaseUrl).hostname;
const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"]);

if (
  !localDatabaseHosts.has(databaseHost) &&
  process.env.ALLOW_REMOTE_E2E_DATABASE !== "true"
) {
  throw new Error(
    "Authenticated E2E tests only use a local database by default. " +
      "Set ALLOW_REMOTE_E2E_DATABASE=true only for an isolated remote test database.",
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
  allowExitOnIdle: true,
  max: 4,
});

export async function createTestUser() {
  const id = `e2e-user-${randomUUID()}`;

  await pool.query(
    `INSERT INTO "User" ("id", "name", "email", "updatedAt")
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
    [id, "E2E Test User", `${id}@example.com`],
  );

  return id;
}

export async function createTestSession(
  userId: string,
  sessionToken: string,
  expires: Date,
) {
  await pool.query(
    `INSERT INTO "Session" ("id", "sessionToken", "userId", "expires")
     VALUES ($1, $2, $3, $4)`,
    [`e2e-session-${randomUUID()}`, sessionToken, userId, expires],
  );
}

export async function createTestCompany(userId: string, name: string) {
  const id = `e2e-company-${randomUUID()}`;

  await pool.query(
    `INSERT INTO "Company" ("id", "userId", "name", "updatedAt")
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
    [id, userId, name],
  );

  return { id, name };
}

export async function findTestTask(userId: string) {
  const result = await pool.query<{
    companyId: string | null;
    isCompleted: boolean;
    title: string;
  }>(
    `SELECT "companyId", "isCompleted", "title"
     FROM "Task"
     WHERE "userId" = $1
     ORDER BY "createdAt" DESC
     LIMIT 1`,
    [userId],
  );

  return result.rows[0] ?? null;
}

export async function findTestInterviewLog(companyId: string) {
  const result = await pool.query<{
    interviewType: string | null;
    questions: string | null;
  }>(
    `SELECT "interviewType", "questions"
     FROM "InterviewLog"
     WHERE "companyId" = $1
     ORDER BY "createdAt" DESC
     LIMIT 1`,
    [companyId],
  );

  return result.rows[0] ?? null;
}

export async function deleteTestUser(userId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM "InterviewLog"
       WHERE "companyId" IN (
         SELECT "id" FROM "Company" WHERE "userId" = $1
       )`,
      [userId],
    );
    await client.query(`DELETE FROM "Task" WHERE "userId" = $1`, [userId]);
    await client.query(`DELETE FROM "Company" WHERE "userId" = $1`, [
      userId,
    ]);
    await client.query(`DELETE FROM "Session" WHERE "userId" = $1`, [
      userId,
    ]);
    await client.query(`DELETE FROM "Account" WHERE "userId" = $1`, [
      userId,
    ]);
    await client.query(`DELETE FROM "User" WHERE "id" = $1`, [userId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
