import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../Domain/enums/UserRole';

export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user || !allowedRoles.includes(user.role)) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        next();
    };
};