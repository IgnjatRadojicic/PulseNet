import { apiGet, apiPost, apiPut, apiDelete } from '../../helpers/api';
import type { ApiResponse } from '../../helpers/api';
import type { ICommunityApiService } from './ICommunityAPIService';
import type { CommunityDto } from '../../models/communities/CommunityDto';

export const communityApi: ICommunityApiService = {
    getPublic(): Promise<ApiResponse<CommunityDto[]>> {
        return apiGet<CommunityDto[]>('communities/public');
    },

    getMine(): Promise<ApiResponse<CommunityDto[]>> {
        return apiGet<CommunityDto[]>('communities/mine');
    },

    getAll(): Promise<ApiResponse<CommunityDto[]>> {
        return apiGet<CommunityDto[]>('communities/all');
    },

    getById(id: number): Promise<ApiResponse<CommunityDto>> {
        return apiGet<CommunityDto>(`communities/${id}`);
    },

    getUserCommunities(userId: number): Promise<ApiResponse<CommunityDto[]>> {
        return apiGet<CommunityDto[]>(`users/${userId}/communities`);
    },

    search(query: string): Promise<ApiResponse<CommunityDto[]>> {
        return apiGet<CommunityDto[]>(`communities/search?q=${encodeURIComponent(query)}`);
    },

    create(data: { name: string; description?: string; rules?: string; avatar?: string; type: string }): Promise<ApiResponse<CommunityDto>> {
        return apiPost<CommunityDto>('communities', data);
    },

    update(id: number, data: { name: string; description?: string; rules?: string; avatar?: string; type: string }): Promise<ApiResponse<CommunityDto>> {
        return apiPut<CommunityDto>(`communities/${id}`, data);
    },

    remove(id: number): Promise<ApiResponse<boolean>> {
        return apiDelete<boolean>(`communities/${id}`);
    },

    join(id: number): Promise<ApiResponse<boolean>> {
        return apiPost<boolean>(`communities/${id}/join`);
    },

    leave(id: number): Promise<ApiResponse<boolean>> {
        return apiDelete<boolean>(`communities/${id}/leave`);
    },
};