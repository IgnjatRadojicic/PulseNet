import { UserAuthDataDto } from '../../Domain/DTOs/auth/UserAuthDataDto';
import { User } from '../../Domain/models/User';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import bcrypt from 'bcryptjs';

export class AuthService implements IAuthService {
    private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || '10', 10);

    public constructor(private userRepository: IUserRepository) {}

    async login(username: string, password: string): Promise<ServiceResult<UserAuthDataDto>> {
        const user = await this.userRepository.getByUsername(username);

        if (user.id === 0) {
            return { success: false, message: 'Invalid username or password', statusCode: 401 };
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return { success: false, message: 'Invalid username or password', statusCode: 401 };
        }

        return {
            success: true,
            data: new UserAuthDataDto(user.id, user.username, user.email, user.role),
        };
    }

    async register(
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        password: string,
        bio?: string,
        profileImage?: string
    ): Promise<ServiceResult<UserAuthDataDto>> {
        const existingUsername = await this.userRepository.getByUsername(username);
        if (existingUsername.id !== 0) {
            return { success: false, message: 'Username is already taken', statusCode: 409 };
        }

        const existingEmail = await this.userRepository.getByEmail(email);
        if (existingEmail.id !== 0) {
            return { success: false, message: 'Email is already taken', statusCode: 409 };
        }

        const hashedPassword = await bcrypt.hash(password, this.saltRounds);

        const newUser = await this.userRepository.create(
            new User(0, username, email, firstName, lastName, bio ?? null, profileImage ?? null, 'user', hashedPassword)
        );

        if (newUser.id === 0) {
            return { success: false, message: 'Registration failed', statusCode: 500 };
        }

        return {
            success: true,
            data: new UserAuthDataDto(newUser.id, newUser.username, newUser.email, newUser.role),
            statusCode: 201,
        };
    }
}