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

app.use('/api/v1', authController.getRouter());
app.use('/api/v1', userController.getRouter());
app.use('/api/v1', healthController.getRouter());

export default app;