import { Audit } from '../../models/Audit';
import { RepositoryResult } from '../../types/RepositoryResult';

export interface IAuditRepository {
    create(audit: Audit): Promise<RepositoryResult<Audit>>;
    getAll(limit: number, offset: number): Promise<Audit[]>;
    getByUserId(userId: number, limit: number, offset: number): Promise<Audit[]>;
    getTotalCount(): Promise<number>;
}
