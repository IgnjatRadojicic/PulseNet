import type { ApiResponse } from '../../helpers/api';
import type { UserDto } from '../../models/users/UserDto';

export interface IUsersApiService {
    getAllUsers(): Promise<ApiResponse<UserDto[]>>;
    getUserById(id: number): Promise<ApiResponse<UserDto>>;
    getMe(): Promise<ApiResponse<UserDto>>;
    updateProfile(data: { username: string; email: string; firstName: string; lastName: string; bio?: string; profileImage?: string }): Promise<ApiResponse<UserDto>>;
    searchUsers(query: string): Promise<ApiResponse<UserDto[]>>;
    followUser(userId: number): Promise<ApiResponse<boolean>>;
    unfollowUser(userId: number): Promise<ApiResponse<boolean>>;
    getFollowers(userId: number): Promise<ApiResponse<UserDto[]>>;
    getFollowing(userId: number): Promise<ApiResponse<UserDto[]>>;
    updateRole(userId: number, role: string): Promise<ApiResponse<boolean>>;
}