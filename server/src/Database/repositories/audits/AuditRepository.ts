import { BaseRepository } from '../BaseRepository';
import { IAuditRepository } from '../../../Domain/repositories/audit/IAuditRepository';
import { Audit } from '../../../Domain/models/Audit';
import { mapAudit, AUDIT_FIELDS } from '../../mappers/AuditMapper';

export class AuditRepository extends BaseRepository implements IAuditRepository {

    async create(audit: Audit): Promise<Audit | null> {
        const result = await this.executeWrite(
            'INSERT INTO audits (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [audit.userId, audit.action, audit.entityType, audit.entityId, audit.details, audit.ipAddress, audit.userAgent]
        );
        if (!result?.insertId) return null;
        return new Audit(
            result.insertId, audit.userId, audit.action, audit.entityType,
            audit.entityId, audit.details, audit.ipAddress, audit.userAgent, new Date()
        );
    }

async getAll(limit: number, offset: number): Promise<Audit[]> {
    const safeLimit = Math.max(1, Math.floor(Number(limit)));
    const safeOffset = Math.max(0, Math.floor(Number(offset)));
    return this.executeRead(
        `SELECT ${AUDIT_FIELDS} FROM audits ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        [],
        mapAudit
    );
}

async getByUserId(userId: number, limit: number, offset: number): Promise<Audit[]> {
    return this.executeRead(
        `SELECT ${AUDIT_FIELDS} FROM audits WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [Number(userId), Number(limit), Number(offset)],
        mapAudit
    );
}

    async getTotalCount(): Promise<number> {
        return await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM audits',
            []
        ) ?? 0;
    }
}