const os = require('os');
const prisma = require('../../config/database');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

const parseDbUrl = () => {
  const url = config.db.url;
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) return null;
  return { user: match[1], password: match[2], host: match[3], port: match[4], database: match[5] };
};

class SettingsService {
  async getSystemHealth() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const loadAvg = os.loadavg();

    let dbConnected = false;
    let dbLatency = null;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - start;
      dbConnected = true;
    } catch { }

    const cpuUsage = cpus.map((cpu, i) => ({
      core: i,
      model: cpu.model,
      speed: cpu.speed,
      usage: Math.round((1 - cpu.times.idle / (cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq)) * 100),
    }));

    const recordCounts = {};
    const models = ['Role', 'Permission', 'User', 'Employee', 'Project', 'InternalProject', 'Treasury', 'FinanceTransaction', 'Expense', 'AuditLog', 'SalaryPayment'];
    for (const model of models) {
      try {
        recordCounts[model] = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].count();
      } catch { recordCounts[model] = 0; }
    }

    return {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: os.platform(),
      hostname: os.hostname(),
      cpu: {
        cores: cpus.length,
        model: cpus[0]?.model || 'N/A',
        coresUsage: cpuUsage,
        averageLoad: loadAvg,
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: totalMem - freeMem,
        usagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
      },
      database: {
        connected: dbConnected,
        latencyMs: dbLatency,
        name: parseDbUrl()?.database || 'bluedesk_erp',
      },
      records: recordCounts,
    };
  }

  async createBackup() {
    const dbConfig = parseDbUrl();
    if (!dbConfig) throw new Error('Invalid DATABASE_URL');

    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bluedesk_backup_${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    return new Promise((resolve, reject) => {
      const mysqldump = process.platform === 'win32'
        ? '"C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump"'
        : 'mysqldump';
      const cmd = `${mysqldump} -u${dbConfig.user} -p${dbConfig.password} -h${dbConfig.host} -P${dbConfig.port} ${dbConfig.database} > "${filepath}"`;
      exec(cmd, { maxBuffer: 1024 * 1024 * 200 }, (error, stdout, stderr) => {
        if (error) return reject(error);
        resolve({ filepath, filename, size: fs.statSync(filepath).size });
      });
    });
  }
}

module.exports = new SettingsService();
