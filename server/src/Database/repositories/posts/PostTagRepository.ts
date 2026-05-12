import { IPostTagRepository } from '../../../Domain/repositories/post_repository/IPostTagRepository';
import { RowDataPacket } from 'mysql2';
import { BaseRepository } from '../BaseRepository';

export class PostTagRepository extends BaseRepository implements IPostTagRepository {
    
    async addTag(postId: number, tagId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)',
            [postId, tagId]
        );
        return (result !== null);
    }

    async addTags(postId: number, tagIds: number[]): Promise<boolean> {
        if (tagIds.length === 0) return true;
        const placeholders = tagIds.map(() => '(?, ?)').join(', ');
        const results = tagIds.flatMap(tagId => [postId, tagId]);
        const result = await this.executeWrite(
            `INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES ${placeholders}`,
            results
        );
        return (result !== null);
    }

    async removeTag(postId: number, tagId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM post_tags WHERE post_id = ? AND tag_id = ?',
            [postId, tagId]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async getTagIds(postId: number): Promise<number[]> {
        const result = await this.executeRead(
            'SELECT tag_id FROM post_tags WHERE post_id = ?',
            [postId],
            (r: RowDataPacket) => r.tag_id as number
        );
        return result;
    }

    async getTagIdsBatch(postIds: number[]): Promise<Map<number, number[]>> {
        if (postIds.length === 0) return new Map<number, number[]>();
        const placeholders = this.buildPlaceholders(postIds);
        const result = await this.executeRead(
            `SELECT post_id, tag_id FROM post_tags WHERE post_id IN (${placeholders})`,
            postIds,
            (r: RowDataPacket) => ({ postId: r.post_id as number, tagId: r.tag_id as number })
        );
        const tagMap = new Map<number, number[]>();
        result.forEach(r => {
            if (!tagMap.has(r.postId)) {
                tagMap.set(r.postId, []);
            }
            tagMap.get(r.postId)?.push(r.tagId);
        });
        return tagMap;
    }

}