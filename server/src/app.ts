import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRepository } from './Database/repositories/users/UserRepository';
import { AuthService } from './Services/auth/AuthService';
import { UserService } from './Services/users/UserService';
import { AuthController } from './WebAPI/controllers/AuthController';
import { UserController } from './WebAPI/controllers/UserController';
import { HealthController } from './WebAPI/controllers/HealthController';
import { IUserRepository } from './Domain/repositories/users/IUserRepository';
import { IAuthService } from './Domain/services/auth/IAuthService';
import { IUserService } from './Domain/services/users/IUserService';
import { CommentRepository } from './Database/repositories/comments/CommentRepository';
import { CommentService } from './Services/comments/CommentService';
import { CommentController } from './WebAPI/controllers/CommentController';
import { ICommentRepository } from './Domain/repositories/comments/ICommentRepository';
import { ICommentService } from './Domain/services/comments/ICommentService';
import { IPostRepository } from './Domain/repositories/posts/IPostRepository';
import { PostRepository } from './Database/repositories/posts/PostRepository';
import { ICommunityRepository } from './Domain/repositories/communities/ICommunityRepository';
import { CommunityRepository } from './Database/repositories/communities/CommunityRepository';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const userRepository: IUserRepository = new UserRepository();
const authService: IAuthService = new AuthService(userRepository);
const userService: IUserService = new UserService(userRepository);

const authController = new AuthController(authService);
const userController = new UserController(userService);
const healthController = new HealthController();

const commentRepository: ICommentRepository = new CommentRepository();
const postRepository: IPostRepository = new PostRepository();
const communityRepository: ICommunityRepository = new CommunityRepository();
const commentService: ICommentService = new CommentService(commentRepository, postRepository, userRepository, communityRepository);
const commentController = new CommentController(commentService);

app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', healthController.getRouter());
app.use('/api/v1', commentController.getRouter());

export default app;