import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
import { ServiceResult } from "../../Domain/types/ServiceResult";

dotenv.config();

type NodeStatus = 'healthy' | 'degraded' | 'unreachable'

interface DbNode {

  pool: Pool;
  status: NodeStatus;
  responseTime: number;
  lastChecked: Date | null;
  name: string;
}

interface HealthStatus {
  name: string
  status: NodeStatus 
  responseTime: number;
  lastChecked: Date | null;
}

const DEGRADED_THERSHOLD_MS = 500;

const masterNode: DbNode = {
  pool: mysql.createPool({
    host: process.env.DB_MASTER_HOST,
    port: Number(process.env.DB_MASTER_HOST) || 3306,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  }),
  status: 'healthy',
  responseTime: 0,
  lastChecked: null,
  name: 'master',
};

const slaveNodes: DbNode[] = [
    {
        pool: mysql.createPool({
            host: process.env.DB_SLAVE1_HOST,
            port: Number(process.env.DB_SLAVE1_PORT) || 3307,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
        }),
        status: 'healthy',
        responseTime: 0,
        lastChecked: null,
        name: 'slave1',
    },
    {
        pool: mysql.createPool({
            host: process.env.DB_SLAVE2_HOST,
            port: Number(process.env.DB_SLAVE2_PORT) || 3308,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
        }),
        status: 'healthy',
        responseTime: 0,
        lastChecked: null,
        name: 'slave2',
    },
]; 

let currentMaster: DbNode = masterNode;
let currentSlaveIndex = 0;
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

async function checkNode(node: DbNode) : Promise<void> {
  const start = Date.now();
  try {
    const conn = await node.pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    const elapsed = Date.now() - start;
    node.status = elapsed > DEGRADED_THERSHOLD_MS ? 'degraded' : 'healthy';
  } catch {
    node.status = 'unreachable';
    node.responseTime = -1;
  } finally {
    node.lastChecked = new Date();
  }
}

export function startHealthCheck(intervalMS: number = 10000): void {
  if (healthCheckInterval) return;

  healthCheckInterval = setInterval(async () => {
      await checkNode(currentMaster);

      for (const slave of slaveNodes) {
          await checkNode(slave);
      }

      if(currentMaster.status === 'unreachable') {
        const healthySlave = slaveNodes.find(s => s.status !== 'unreachable');
        if (healthySlave) {
          console.warn('[db] Master unreachable prompting ${healthySlave.name} to master');
          currentMaster = healthySlave;
        }
      }
  }, intervalMS );
}

export function getWriteConnection() : ServiceResult<Pool> {
  if (currentMaster.status === 'unreachable') {
      return { success: false, message: 'The master node is unreachable writing is not reachable'};
  }
  return { success: true, data: currentMaster.pool};
}

export function getReadConnection(): ServiceResult<Pool> {
  const healthySlaves = slaveNodes.filter(
    s => s !== currentMaster && s.status !== 'unreachable'
  );

  if (healthySlaves.length === 0) {
    if (currentMaster.status === 'unreachable') {
      return {success: false, message: 'No DB node is available'}
    }
    return {success: true, data: currentMaster.pool};
  }

  const slave = healthySlaves[currentSlaveIndex % healthySlaves.length];
  currentSlaveIndex++;
  return {success: true, data: slave.pool};
}

export function getHealthStatus(): HealthStatus[] {
  return [currentMaster, ...slaveNodes].map(node => ({

    name: node.name,
    status: node.status,
    responseTime: node.responseTime,
    lastChecked: node.lastChecked,
  }));
}

  export function promoteSlaveToMaster(slaveIdx: number): ServiceResult<string> {
    const slave = slaveNodes[slaveIdx];
    if(!slave) {
      return {success: false, message: 'Slave on index ${slaveIdx} does not exist'};
    }
    console.warn('[db] Manual promotion happened ${slave.name} became a master');
    currentMaster = slave;
    return {success: true, data: slave.name};
  }