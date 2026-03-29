import { UserDto } from '../../Domain/DTOs/users/UserDto';
import { User } from '../../Domain/models/User';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { IUserService } from '../../Domain/services/users/IUserService';
import { ServiceResult } from '../../Domain/types/ServiceResult';

export class UserService implements IUserService {
    public constructor(private userRepository: IUserRepository) {}

    async getAllUsers(): Promise<ServiceResult<UserDto[]>> {
        const users: User[] = await this.userRepository.getAll();
        return {
            success: true,
            data: users.map(u => new UserDto(u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.profileImage, u.role)),
        };
    }

    async getUserById(id: number): Promise<ServiceResult<UserDto>> {
        const user = await this.userRepository.getById(id);
        if (user.id === 0) {
            return { success: false, message: 'User not found', statusCode: 404 };
        }
        return {
            success: true,
            data: new UserDto(user.id, user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.role),
        };
    }

    async updateProfile(
        id: number,
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        bio?: string,
        profileImage?: string
    ): Promise<ServiceResult<UserDto>> {
        const existing = await this.userRepository.getById(id);
        if (existing.id === 0) {
            return { success: false, message: 'User not found', statusCode: 404 };
        }

        const updated = new User(id, username, email, firstName, lastName, bio ?? null, profileImage ?? null, existing.role, existing.passwordHash);
        const result = await this.userRepository.update(updated);

        if (result.id === 0) {
            return { success: false, message: 'Update failed', statusCode: 500 };
        }

        return {
            success: true,
            data: new UserDto(result.id, result.username, result.email, result.firstName, result.lastName, result.bio, result.profileImage, result.role),
        };
    }

    async updateRole(id: number, role: string): Promise<ServiceResult<boolean>> {
        const existing = await this.userRepository.getById(id);
        if (existing.id === 0) {
            return { success: false, message: 'User not found', statusCode: 404 };
        }
        const result = await this.userRepository.updateRole(id, role);
        if (!result) {
            return { success: false, message: 'Role update failed', statusCode: 500 };
        }
        return { success: true, data: true };
    }

    async searchUsers(query: string): Promise<ServiceResult<UserDto[]>> {
        const users = await this.userRepository.searchByUsername(query);
        return {
            success: true,
            data: users.map(u => new UserDto(u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.profileImage, u.role)),
        };
    }

    async followUser(followerId: number, followingId: number): Promise<ServiceResult<boolean>> {
        if (followerId === followingId) {
            return { success: false, message: 'You cannot follow yourself', statusCode: 400 };
        }
        const target = await this.userRepository.getById(followingId);
        if (target.id === 0) {
            return { success: false, message: 'User not found', statusCode: 404 };
        }
        const result = await this.userRepository.follow(followerId, followingId);
        if (!result) {
            return { success: false, message: 'Follow failed', statusCode: 500 };
        }
        return { success: true, data: true };
    }

    async unfollowUser(followerId: number, followingId: number): Promise<ServiceResult<boolean>> {
        const result = await this.userRepository.unfollow(followerId, followingId);
        if (!result) {
            return { success: false, message: 'You are not following this user', statusCode: 400 };
        }
        return { success: true, data: true };
    }

    async getFollowers(id: number): Promise<ServiceResult<UserDto[]>> {
        const users = await this.userRepository.getFollowers(id);
        return {
            success: true,
            data: users.map(u => new UserDto(u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.profileImage, u.role)),
        };
    }

    async getFollowing(id: number): Promise<ServiceResult<UserDto[]>> {
        const users = await this.userRepository.getFollowing(id);
        return {
            success: true,
            data: users.map(u => new UserDto(u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.profileImage, u.role)),
        };
    }
}