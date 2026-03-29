import { Request, Response, Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { getHealthStatus, promoteSlaveToMaster } from '../../Database/connection/DbConnectionPool';

export class HealthController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/health', this.health.bind(this));
    this.router.get('/health/db', authenticate, authorize('admin'), this.dbHealth.bind(this));
    this.router.post('/health/failover', authenticate, authorize('admin'), this.failover.bind(this));
  }

  private async health(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({ success: true, message: 'Server started successfully' });
    } catch (error) {
      console.error('[HealthController] health error', error);
      res.status(500).json({ success: false, message: 'Error occured on server side' });
    }
  }

  private async dbHealth(req: Request, res: Response): Promise<void> {
    try {
      const status = getHealthStatus();
      res.status(200).json({ success: true, data: status });
    } catch (error) {
      console.error('[HealthController] dbHealth error', error);
      res.status(500).json({ success: false, message: 'Error occured while checking database status' });
    }
  }

  private async failover(req: Request, res: Response): Promise<void> {
    try {
      const { slaveIndex } = req.body;

      if (slaveIndex === undefined || slaveIndex === null || typeof slaveIndex !== 'number' || !Number.isInteger(slaveIndex)) {
        res.status(400).json({ success: false, message: 'Invalid slaveIndex. Integer is expected.' });
        return;
      }

      const result = promoteSlaveToMaster(slaveIndex);

      if (!result.success) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }

      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      console.error('[HealthController] failover error', error);
      res.status(500).json({ success: false, message: 'Error occured during failover operation' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}