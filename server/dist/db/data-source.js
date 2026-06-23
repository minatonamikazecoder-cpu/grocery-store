"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
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
