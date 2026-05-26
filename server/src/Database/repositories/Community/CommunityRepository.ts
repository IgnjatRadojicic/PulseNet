import { Community } from '../../../Domain/models/Community';
import { ICommunityRepository } from '../../../Domain/repositories/communities/ICommunityRepository';
import { BaseRepository } from '../BaseRepository';
import { mapCommunity, COMMUNITY_FIELDS } from '../../mappers/CommunityMapper';
import { RowDataPacket } from 'mysql2';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class CommunityRepository extends BaseRepository implements ICommunityRepository {

    async create(community: Community): Promise<RepositoryResult<Community>> {
        try {
            const result = await this.executeWrite(
                'INSERT INTO communities (name, description, rules, type, avatar, creator_id) VALUES (?, ?, ?, ?, ?, ?)',
                [community.name, community.description, community.rules, community.type, community.avatar, community.creatorId]
            );
            if (!result.ok) return RepositoryResult.failure(result.message);
            if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');

            return RepositoryResult.success(
                new Community(result.data.insertId, community.name, community.description, community.rules, community.type, community.avatar, community.creatorId, new Date())
            );
        } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY') return RepositoryResult.failure('Duplicate community name');
            throw err;
        }
    }

    async getById(id: number): Promise<RepositoryResult<Community>> {
        return this.executeReadOne(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE id = ?`,
            [id],
            mapCommunity
        );
    }

    async searchByName(query: string): Promise<Community[]> {
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE name LIKE ? ORDER BY name ASC LIMIT 20`,
            [`%${query}%`],
            mapCommunity
        );
    }

    async getByIds(ids: number[]): Promise<Community[]> {
        if (!ids || ids.length === 0) return [];
        const placeholders = this.buildPlaceholders(ids);
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE id IN (${placeholders})`,
            ids,
            mapCommunity
        );
    }

    async getAll(): Promise<Community[]> {
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities ORDER BY id ASC`,
            [],
            mapCommunity
        );
    }

    async getPublic(): Promise<Community[]> {
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE type = 'public'`,
            [],
            mapCommunity
        );
    }

    async getByUserId(userId: number): Promise<Community[]> {
        const ids = await this.executeRead(
            'SELECT community_id FROM community_members WHERE user_id = ?',
            [userId],
            (r: RowDataPacket) => r.community_id as number
        );
        if (!ids || ids.length === 0) return [];
        return this.getByIds(ids);
    }

    async update(community: Community): Promise<RepositoryResult<Community>> {
        const result = await this.executeWrite(
            'UPDATE communities SET name = ?, description = ?, rules = ?, type = ?, avatar = ? WHERE id = ?',
            [community.name, community.description, community.rules, community.type, community.avatar, community.id]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (result.data.affectedRows === 0) return RepositoryResult.notFound('Community not found for update');

        return RepositoryResult.success(community);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM communities WHERE id = ?',
            [id]
        );
        return result.ok && result.data.affectedRows > 0;
    }
}
