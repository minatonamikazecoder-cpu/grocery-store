import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // Auto-sync entities with db tables (use false in production with migrations)
  logging: false,
  entities: [__dirname + "/../models/*.{js,ts}"],
  migrations: [],
  subscribers: [],
  extra: {
    max: 20, // Max connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
});
