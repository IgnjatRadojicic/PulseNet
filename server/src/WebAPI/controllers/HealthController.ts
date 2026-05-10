import { Request, Response, Router } from 'express';
import { getHealthStatus, promoteSlaveToMaster } from '../../Database/connection/DbConnectionPool';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { sendServiceResult } from '../helpers/responseHelper';
import { ErrorCode } from '../../Domain/enums/ErrorCode';

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
        const result = { success: true, data: { message: 'Server is running' } };
        sendServiceResult(res, result);
    }

    private dbHealth(req: Request, res: Response): void {
        try {
            const status = getHealthStatus();
            const result = { success: true, data: status };
            sendServiceResult(res, result);
        } catch {
            const result = { success: false, message: 'Failed to retrieve DB health status', errorCode: ErrorCode.INTERNAL_ERROR };
            sendServiceResult(res, result);
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
            sendServiceResult(res, result);
        } catch {
            const result = { success: false, message: 'Failover failed', errorCode: ErrorCode.INTERNAL_ERROR };
            sendServiceResult(res, result);
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}