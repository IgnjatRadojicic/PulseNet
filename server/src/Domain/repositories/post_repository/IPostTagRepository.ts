export interface IPostTagRepository {
    addTag(postId: number, tagId: number): Promise<boolean>;
    addTags(postId: number, tagIds: number[]): Promise<boolean>;
    removeTag(postId: number, tagId: number): Promise<boolean>;
    getTagIds(postId: number): Promise<number[]>;
    getTagIdsBatch(postIds: number[]): Promise<Map<number, number[]>>;
}
