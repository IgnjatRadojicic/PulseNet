import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getReadConnection, getWriteConnection } from '../connection/DbConnectionPool';
import { RepositoryResult } from '../../Domain/types/RepositoryResult';

type QueryParam = string | number | boolean | null | Buffer | Date;
type QueryParams = QueryParam[];

export abstract class BaseRepository {

    protected async executeRead<T>(
        query: string,
        params: QueryParams,
        mapper: (row: RowDataPacket) => T
    ): Promise<T[]> {
        const conn = getReadConnection();
        if (!conn.success || !conn.data) return [];
        const [rows] = await conn.data.execute<RowDataPacket[]>(query, params);
        return rows.map(mapper);
    }

protected async executeReadOne<T>(
    query: string,
    params: QueryParams,
    mapper: (row: RowDataPacket) => T
): Promise<RepositoryResult<T>> {
    const conn = getReadConnection();
    console.log('[BaseRepository] executeReadOne connection:', { success: conn.success, hasData: !!conn.data });
    if (!conn.success || !conn.data) {
        return RepositoryResult.failure('Read connection unavailable');
    }
        const [rows] = await conn.data.execute<RowDataPacket[]>(query, params);
        if (rows.length === 0) {
            return RepositoryResult.notFound();
        }
        return RepositoryResult.success(mapper(rows[0]));
    }

    protected async executeWrite(
        query: string,
        params: QueryParams,
    ): Promise<RepositoryResult<ResultSetHeader>> {
        const conn = getWriteConnection();
        if (!conn.success || !conn.data) {
            return RepositoryResult.failure('Write connection unavailable');
        }
        const [result] = await conn.data.execute<ResultSetHeader>(query, params);
        return RepositoryResult.success(result);
    }

    protected async executeScalar<T>(
        query: string,
        params: QueryParams,
        field: string = 'count'
    ): Promise<RepositoryResult<T>> {
        const conn = getReadConnection();
        if (!conn.success || !conn.data) {
            return RepositoryResult.failure('Read connection unavailable');
        }
        const [rows] = await conn.data.execute<RowDataPacket[]>(query, params);
        if (rows.length === 0) {
            return RepositoryResult.notFound();
        }
        return RepositoryResult.success(rows[0][field] as T);
    }

    protected buildPlaceholders(items: QueryParams): string {
        return items.map(() => '?').join(',');
    }
}
