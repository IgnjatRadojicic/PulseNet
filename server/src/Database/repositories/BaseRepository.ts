import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getReadConnection, getWriteConnection } from '../connection/DbConnectionPool';

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
    ): Promise<T | null> {
        const results = await this.executeRead(query, params, mapper);
        return results.length > 0 ? results [0] : null;
    }

    protected async executeWrite(
        query: string,
        params: QueryParams,
    ): Promise<ResultSetHeader | null> {
        const conn = getWriteConnection();
        if (!conn.success || !conn.data) return null;
        const [result] = await conn.data.execute<ResultSetHeader>(query, params);
        return result;
    }
    
    protected async executeScalar<T>(
        query: string,
        params: QueryParams,
        field: string = 'count'
    ): Promise<T | null> {
        const conn = getReadConnection();
        if (!conn.success || !conn.data) return null;
        const [rows] = await conn.data.execute<RowDataPacket[]>(query, params);
        if (rows.length === 0) return null;
        return rows[0][field] as T;
    }

    protected buildPlaceholders(items: QueryParams): string {
        return items.map(() => '?').join(',');  
    }

}