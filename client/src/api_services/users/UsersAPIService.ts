import { apiGet, apiPost, apiPut, apiDelete } from '../../helpers/api';
import type { ApiResponse } from '../../helpers/api';
import type { IUsersApiService } from './IUsersAPIService';
import type { UserDto } from '../../models/users/UserDto';

export const usersApiService: IUsersApiService = {
    getAllUsers(): Promise<ApiResponse<UserDto[]>> {
        return apiGet<UserDto[]>('users/all');
    },

    getUserById(id: number): Promise<ApiResponse<UserDto>> {
        return apiGet<UserDto>(`users/${id}`);
    },

    getMe(): Promise<ApiResponse<UserDto>> {
        return apiGet<UserDto>('users/me');
    },

    updateProfile(data: { username: string; email: string; firstName: string; lastName: string; bio?: string; profileImage?: string }): Promise<ApiResponse<UserDto>> {
        return apiPut<UserDto>('users/me', data);
    },

    searchUsers(query: string): Promise<ApiResponse<UserDto[]>> {
        return apiGet<UserDto[]>(`users/search?q=${encodeURIComponent(query)}`);
    },

    followUser(userId: number): Promise<ApiResponse<boolean>> {
        return apiPost<boolean>(`users/${userId}/follow`);
    },

    unfollowUser(userId: number): Promise<ApiResponse<boolean>> {
        return apiDelete<boolean>(`users/${userId}/follow`);
    },

    getFollowers(userId: number): Promise<ApiResponse<UserDto[]>> {
        return apiGet<UserDto[]>(`users/${userId}/followers`);
    },

    getFollowing(userId: number): Promise<ApiResponse<UserDto[]>> {
        return apiGet<UserDto[]>(`users/${userId}/following`);
    },

    updateRole(userId: number, role: string): Promise<ApiResponse<boolean>> {
        return apiPut<boolean>(`users/${userId}/role`, { role });
    },
};