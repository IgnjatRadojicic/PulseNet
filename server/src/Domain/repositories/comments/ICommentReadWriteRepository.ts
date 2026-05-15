import { Comment } from "../../models/Comment";

export interface ICommentReadWriteRepository {
    getById(id: number): Promise<Comment | null>;
    getByPost(postId: number): Promise<Comment[]>;
    getByAuthor(authorId: number): Promise<Comment[]>;
    create(comment: Comment): Promise<Comment | null>;
    update(id: number, content: string): Promise<boolean>;
    softDelete(id: number): Promise<boolean>;
    setFlag(id: number, isFlagged: boolean): Promise<boolean>;
}