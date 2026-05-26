import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
import { ServiceResult } from "../../Domain/types/ServiceResult";

dotenv.config();

type NodeStatus = 'healthy' | 'degraded' | 'unreachable';

interface HealthStatus {
    name: string;
    status: NodeStatus;
    responseTime: number;
    lastChecked: Date | null;
}

const DEGRADED_THRESHOLD_MS = 500;

let status: NodeStatus = 'healthy';
let responseTime = 0;
let lastChecked: Date | null = null;

const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: true }
        : undefined,
    waitForConnections: true,
    connectionLimit: 10,
});

let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

async function checkNode(): Promise<void> {
    const start = Date.now();
    const prevStatus = status;

    try {
        const conn = await pool.getConnection();
        await conn.query('SELECT 1');
        conn.release();
        const elapsed = Date.now() - start;
        responseTime = elapsed;
        status = elapsed > DEGRADED_THRESHOLD_MS ? 'degraded' : 'healthy';
    } catch {
        status = 'unreachable';
        responseTime = -1;
    } finally {
        lastChecked = new Date();
    }

    if (prevStatus !== status) {
        console.warn(`[db] status changed: ${prevStatus} -> ${status}`);
    }
}

export function startHealthCheck(intervalMS: number = 10000): void {
    if (healthCheckInterval) return;
    healthCheckInterval = setInterval(checkNode, intervalMS);
}

export function getWriteConnection(): ServiceResult<Pool> {
    if (status === 'unreachable') {
        return { success: false, message: 'Database is unreachable, writing is not available' };
    }
    return { success: true, data: pool };
}

export function getReadConnection(): ServiceResult<Pool> {
    if (status === 'unreachable') {
        return { success: false, message: 'Database is unreachable' };
    }
    return { success: true, data: pool };
}

export function getHealthStatus(): HealthStatus[] {
    return [{
        name: 'primary',
        status,
        responseTime,
        lastChecked,
    }];
}