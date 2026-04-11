import type { UserDto } from '../../models/users/UserDto';
import type { ApiResponse } from '../../types/api/ApiResponse';

export interface IUsersAPIService {
    getAllUsers(token: string): Promise<ApiResponse<UserDto[]>>;
    getUserById(id: number): Promise<ApiResponse<UserDto>>;
    getMe(token: string): Promise<ApiResponse<UserDto>>;
    updateProfile(token: string, data: Partial<UserDto>): Promise<ApiResponse<UserDto>>;
    searchUsers(token: string, query: string): Promise<ApiResponse<UserDto[]>>;
    followUser(token: string, userId: number): Promise<ApiResponse<boolean>>;
    unfollowUser(token: string, userId: number): Promise<ApiResponse<boolean>>;
    getFollowers(userId: number): Promise<ApiResponse<UserDto[]>>;
    getFollowing(userId: number): Promise<ApiResponse<UserDto[]>>;
    updateRole(token: string, userId: number, role: string): Promise<ApiResponse<boolean>>;
}