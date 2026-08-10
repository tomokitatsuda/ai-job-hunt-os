import assert from "node:assert/strict";
import test from "node:test";

import { assertSafeDatabaseTarget } from "../../src/lib/database-safety";

const options = {
  operation: "Test operation",
};

test("allows PostgreSQL databases on local hosts", () => {
  const localUrls = [
    "postgresql://user:password@localhost:5432/app",
    "postgres://user:password@127.0.0.1:5432/app",
    "postgresql://user:password@[::1]:5432/app",
  ];

  for (const databaseUrl of localUrls) {
    assert.doesNotThrow(() =>
      assertSafeDatabaseTarget(databaseUrl, options),
    );
  }
});

test("blocks a remote database unless it is explicitly allowed", () => {
  const remoteUrl = "postgresql://user:password@db.example.com:5432/app";

  assert.throws(
    () => assertSafeDatabaseTarget(remoteUrl, options),
    /blocked for non-local database host "db\.example\.com"/,
  );
  assert.doesNotThrow(() =>
    assertSafeDatabaseTarget(remoteUrl, {
      ...options,
      allowRemote: true,
    }),
  );
});

test("rejects invalid or non-PostgreSQL URLs", () => {
  assert.throws(
    () => assertSafeDatabaseTarget("not-a-url", options),
    /valid PostgreSQL DATABASE_URL/,
  );
  assert.throws(
    () =>
      assertSafeDatabaseTarget(
        "mysql://user:password@localhost:3306/app",
        options,
      ),
    /requires a PostgreSQL DATABASE_URL/,
  );
});
