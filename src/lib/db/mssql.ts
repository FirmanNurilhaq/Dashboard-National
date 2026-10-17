import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config: sql.config = {
  user: process.env.MSSQL_USER || "sa",
  password: process.env.MSSQL_PASSWORD || "",
  server: process.env.MSSQL_HOST || "localhost",
  port: parseInt(process.env.MSSQL_PORT || "1433", 10),
  database: process.env.MSSQL_DATABASE || "TelecomProductivityDB",
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === "true",
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE === "true",
    enableArithAbort: true,
  },
  pool: {
    max: parseInt(process.env.MSSQL_POOL_MAX || "20", 10),
    min: parseInt(process.env.MSSQL_POOL_MIN || "2", 10),
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getMssqlPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await new sql.ConnectionPool(config).connect();
    pool.on("error", (err) => {
      console.error("MSSQL Pool Error Event:", err);
      pool = null;
    });
    return pool;
  } catch (err: any) {
    console.error("Gagal terhubung ke MS SQL Server:", err.message);
    throw err;
  }
}

export async function query<T = any>(queryString: string, params?: { [key: string]: any }): Promise<T[]> {
  const p = await getMssqlPool();
  const request = p.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  const result = await request.query(queryString);
  return result.recordset as T[];
}

export { sql };
