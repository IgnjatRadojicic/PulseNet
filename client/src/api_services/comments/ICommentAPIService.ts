import type { CommentDto, CreateCommentDto } from "../../models/comments/CommentDTO";

export interface ICommentsAPIService {
  getCommentsByPostId(postId: number, token: string): Promise<CommentDto[]>;
  addComment(postId: number, data: CreateCommentDto, token: string): Promise<CommentDto>;
  updateComment(id: number, content: string, token: string): Promise<CommentDto>;
  deleteComment(id: number, token: string): Promise<void>;
  likeComment(id: number, token: string): Promise<void>;
  unlikeComment(id: number, token: string): Promise<void>;
}