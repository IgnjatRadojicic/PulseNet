import { Request, Response, Router } from 'express';
import { ICommentService } from '../../Domain/services/comments/ICommentService';
import { authenticate, optionalAuthenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { validateCommentContent } from '../validators/CommentValidator';
import { sendServiceResult } from '../helpers/responseHelper';

export class CommentController {
    private router: Router;
    private commentService: ICommentService;

    constructor(commentService: ICommentService) {
        this.router = Router();
        this.commentService = commentService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/posts/:postId/comments', optionalAuthenticate, this.getCommentsByPost.bind(this));
        this.router.post('/posts/:postId/comments', authenticate,this.addComment.bind(this));
        this.router.put('/comments/:id', authenticate, this.updateComment.bind(this));
        this.router.delete('/comments/:id', authenticate, this.deleteComment.bind(this));
        this.router.post('/comments/:id/like', authenticate, this.likeComment.bind(this));
        this.router.delete('/comments/:id/like', authenticate, this.unlikeComment.bind(this));
    }

    private async getCommentsByPost(req: Request, res: Response): Promise<void> {
    try {
        const postId = Number(req.params.postId);
        if (Number.isNaN(postId) || postId <= 0) {
            res.status(400).json({ success: false, message: 'Invalid post id' });
            return;
        }
        const result = await this.commentService.getCommentsByPost({ 
            postId,
            currentUserId: req.user?.id ?? 0,
        });
        sendServiceResult(res, result);
    } catch {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

    private async addComment(req: Request, res: Response): Promise<void> {
        try {
            const { content, parentId } = req.body;
            const postId = Number(req.params.postId);
            if (Number.isNaN(postId) || postId <= 0) {
                res.status(400).json({ success: false, message: 'Invalid post id' });
                return;
            }
            const parentIdNum = parentId !== undefined ? Number(parentId) : null;
            const validation = validateCommentContent(content, parentIdNum);

            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const result = await this.commentService.addComment({
                authorId: req.user!.id, postId, content, parentId: parentIdNum,});
            sendServiceResult(res, result, 201);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async updateComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = Number(req.params.id);
            if (Number.isNaN(commentId) || commentId <= 0) {
                res.status(400).json({ success: false, message: 'Invalid comment id' });
                return;
            }
            const { content } = req.body;
            const validation = validateCommentContent(content, null);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }
            const result = await this.commentService.updateComment({ 
                commentId, requesterId: req.user!.id, content,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async deleteComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = Number(req.params.id);
            if (Number.isNaN(commentId) || commentId <= 0) {
                res.status(400).json({ success: false, message: 'Invalid comment id' });
                return;
            }
            const result = await this.commentService.softDeleteComment({
                commentId, requesterId: req.user!.id,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async likeComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = Number(req.params.id);
            if (Number.isNaN(commentId) || commentId <= 0) {
                res.status(400).json({ success: false, message: 'Invalid comment id' });
                return;
            }
            const result = await this.commentService.likeComment({
                userId: req.user!.id, commentId,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async unlikeComment(req: Request, res: Response): Promise<void> {
        try {
            const commentId = Number(req.params.id);
            if (Number.isNaN(commentId) || commentId <= 0) {
                res.status(400).json({ success: false, message: 'Invalid comment id' });
                return;
            }
            const result = await this.commentService.unlikeComment({
                userId: req.user!.id, commentId,
            });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}