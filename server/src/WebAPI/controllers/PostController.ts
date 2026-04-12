import { Request, Response, Router } from 'express';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { validatePostCreate, validatePostUpdate } from '../validators/PostValidator';

import { IPostService } from "../../Domain/services/post/IPostService";
import { PostSortOption } from "../../Domain/services/post/IPostService";

export class PostController {
    private router: Router;
    private postService: IPostService;

    constructor(postService: IPostService) {
        this.router = Router();
        this.postService = postService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/posts/community/:communityId', this.getByCommunity.bind(this));
        this.router.get('/posts/feed', authenticate, this.getFeed.bind(this));
        this.router.post('/posts', authenticate, this.create.bind(this));
        this.router.get('/posts/:id', authenticate, this.getById.bind(this));
        this.router.put('/posts/:id', authenticate, this.update.bind(this));
        this.router.delete('/posts/:id', authenticate, this.delete.bind(this));
        this.router.post('/posts/:id/like', authenticate, this.addLike.bind(this));
        this.router.delete('/posts/:id/like', authenticate, this.removeLike.bind(this));
        this.router.post('/posts/:id/tags', authenticate, this.addTag.bind(this));
        this.router.delete('/posts/:id/tags/:tagId', authenticate, this.removeTag.bind(this));
    }

    private async getByCommunity(req: Request, res: Response): Promise<void> {
        try {
            const communityId = parseInt(String(req.params.communityId));
            if (isNaN(communityId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const sort: PostSortOption = (req.query.sort as PostSortOption) ?? 'newest';
            const result = await this.postService.getCommunityPosts(communityId, sort);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getFeed(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.postService.getFeed(req.user!.id);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async create(req: Request, res: Response): Promise<void> {
        try {
            const { title, content, mediaUrl, communityId, tagIds } = req.body;
            const validation = validatePostCreate(title, content);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }
            const result = await this.postService.createPost(
                title,
                content,
                mediaUrl ?? null,
                communityId,
                req.user!.id,
                tagIds
            );
            res.status(result.statusCode ?? 201).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.getPostById(id);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const { title, content, mediaUrl } = req.body;
            const validation = validatePostUpdate(title, content);
            if (!validation.valid) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }
            const result = await this.postService.updatePost(
                id,
                req.user!.id,
                title,
                content,
                mediaUrl ?? null
            );
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(String(req.params.id));
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.deletePost(id, req.user!.id);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async addLike(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            if (isNaN(postId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.likePost(req.user!.id, postId);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async removeLike(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            if (isNaN(postId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.unlikePost(req.user!.id, postId);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async addTag(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            if (isNaN(postId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const tagId  = parseInt(req.body.tagId);
            const result = await this.postService.addTag(postId, tagId, req.user!.id);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async removeTag(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(String(req.params.id));
            const tagId  = parseInt(String(req.params.tagId));
            if (isNaN(postId) || isNaN(tagId)) {
                res.status(400).json({ success: false, message: 'Invalid ID' });
                return;
            }
            const result = await this.postService.removeTag(postId, tagId, req.user!.id);
            res.status(result.statusCode ?? 200).json(result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }

}
