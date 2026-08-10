const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const postgresProtocols = new Set(["postgres:", "postgresql:"]);

type DatabaseSafetyOptions = {
  allowRemote?: boolean;
  operation: string;
};

export function assertSafeDatabaseTarget(
  databaseUrl: string,
  { allowRemote = false, operation }: DatabaseSafetyOptions,
) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error(`${operation} requires a valid PostgreSQL DATABASE_URL.`);
  }

  if (!postgresProtocols.has(parsedUrl.protocol)) {
    throw new Error(`${operation} requires a PostgreSQL DATABASE_URL.`);
  }

  const databaseHost = parsedUrl.hostname.replace(/^\[|\]$/g, "");

  if (!localDatabaseHosts.has(databaseHost) && !allowRemote) {
    throw new Error(
      `${operation} is blocked for non-local database host "${databaseHost}".`,
    );
  }
}
