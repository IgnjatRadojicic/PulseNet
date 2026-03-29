import { Request, Response, Router } from 'express';
import { getHealthStatus, promoteSlaveToMaster } from '../../Database/connection/DbConnectionPool';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';

export class HealthController {
    private router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/health', this.healthCheck.bind(this));
        this.router.get('/health/db', authenticate, authorize(UserRole.Admin), this.dbHealth.bind(this));
        this.router.post('/health/failover', authenticate, authorize(UserRole.Admin), this.failover.bind(this));
    }

    private healthCheck(req: Request, res: Response): void {
        res.status(200).json({ success: true, message: 'Server is running' });
    }

    private dbHealth(req: Request, res: Response): void {
        try {
            const status = getHealthStatus();
            res.status(200).json({ success: true, data: status });
        } catch {
            res.status(500).json({ success: false, message: 'Failed to retrieve DB health status' });
        }
    }

    private async failover(req: Request, res: Response): Promise<void> {
        try {
            const { slaveIndex } = req.body;
            if (slaveIndex === undefined || isNaN(Number(slaveIndex))) {
                res.status(400).json({ success: false, message: 'Invalid slaveIndex' });
                return;
            }
            const result = promoteSlaveToMaster(Number(slaveIndex));
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Failover failed' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}