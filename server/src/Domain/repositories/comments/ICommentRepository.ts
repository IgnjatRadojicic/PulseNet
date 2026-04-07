import { Comment } from "../../models/Comment";

export interface ICommentRepository {
    create(comment: Comment): Promise<Comment>;
    getById(id: number): Promise<Comment>;
    getByPost(postId: number): Promise<Comment[]>;
    getByAuthor(authorId: number): Promise<Comment[]>;
    getReplies(parentId: number): Promise<Comment[]>;
    update(id: number, content: string): Promise<boolean>;
    softDelete(id: number): Promise<boolean>;
    setFlag(id: number, isFlagged: boolean): Promise<boolean>;
    like(commentId: number, userId: number): Promise<boolean>;
    unlike(commentId: number, userId: number): Promise<boolean>;
    exists(id: number): Promise<boolean>;
    getLikeCount(commentId: number): Promise<number>;
    hasLiked(userId: number, commentId: number): Promise<boolean>;
}