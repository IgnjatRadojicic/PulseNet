import type { UserDto } from '../../models/users/UserDto';
import type { ApiResponse } from '../../types/api/ApiResponse';
import type { IUsersAPIService } from './IUsersAPIService';
import { API } from '../../constants/api';

function authHeader(token: string) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(url, options);
        return await res.json();
    } catch {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export const usersApiService: IUsersAPIService = {
    getAllUsers: (token) =>
        request<UserDto[]>(`${API.BASE_URL}users/all`, { headers: authHeader(token) }),

    getUserById: (id) =>
        request<UserDto>(`${API.BASE_URL}users/${id}`),

    getMe: (token) =>
        request<UserDto>(`${API.BASE_URL}users/me`, { headers: authHeader(token) }),

    updateProfile: (token, data) =>
        request<UserDto>(`${API.BASE_URL}users/me`, {
            method: 'PUT',
            headers: authHeader(token),
            body: JSON.stringify(data),
        }),

    searchUsers: (token, query) =>
        request<UserDto[]>(`${API.BASE_URL}users/search?q=${encodeURIComponent(query)}`, {
            headers: authHeader(token),
        }),

    followUser: (token, userId) =>
        request<boolean>(`${API.BASE_URL}users/${userId}/follow`, {
            method: 'POST',
            headers: authHeader(token),
        }),

    unfollowUser: (token, userId) =>
        request<boolean>(`${API.BASE_URL}users/${userId}/follow`, {
            method: 'DELETE',
            headers: authHeader(token),
        }),

    getFollowers: (userId) =>
        request<UserDto[]>(`${API.BASE_URL}users/${userId}/followers`),

    getFollowing: (userId) =>
        request<UserDto[]>(`${API.BASE_URL}users/${userId}/following`),

    updateRole: (token, userId, role) =>
        request<boolean>(`${API.BASE_URL}users/${userId}/role`, {
            method: 'PUT',
            headers: authHeader(token),
            body: JSON.stringify({ role }),
        }),
};