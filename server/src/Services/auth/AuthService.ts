import { UserAuthDataDto } from '../../Domain/DTOs/auth/UserAuthDataDto';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { User } from '../../Domain/models/User';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import { LoginInput, RegisterInput } from '../../Domain/types/inputs/AuthInputs';
import bcrypt from 'bcryptjs';

export class AuthService implements IAuthService {
    private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || '10', 10);

    public constructor(private userRepository: IUserRepository) {}

    async login(input: LoginInput): Promise<ServiceResult<UserAuthDataDto>> {

        const user = await this.userRepository.getByUsername(input.username);
        if (!user) {
            return { success: false, message: 'Invalid username or password', errorCode: ErrorCode.UNAUTHORIZED };
        }

        const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!passwordValid) {
            return { success: false, message: 'Invalid username or password', errorCode: ErrorCode.UNAUTHORIZED };
        }

        return {
            success: true,
            data: new UserAuthDataDto(user.id, user.username, user.email, user.role),
        };
    }

    async register(input: RegisterInput): Promise<ServiceResult<UserAuthDataDto>> {

        const existingUsername = await this.userRepository.getByUsername(input.username);
        if (existingUsername) {
            return { success: false, message: 'Username is already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        const existingEmail = await this.userRepository.getByEmail(input.email);
        if (existingEmail) {
            return { success: false, message: 'Email is already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);

        const newUser = await this.userRepository.create(
            new User(0, input.username, input.email, input.firstName, input.lastName, input.bio ?? null, input.profileImage ?? null, 'user', hashedPassword)
        );

        if (!newUser) {
            return { success: false, message: 'Registration failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return {
            success: true,
            data: new UserAuthDataDto(newUser.id, newUser.username, newUser.email, newUser.role),
        };
    }
}
