export type AuditLogInput = {
    userId: number | null;
    action: string;
    entityType: string;
    entityId: number | null;
    details?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
};
 
export type GetAuditLogsInput = {
    page: number;
    limit: number;
};