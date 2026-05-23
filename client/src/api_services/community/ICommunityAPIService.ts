import type { ApiResponse } from '../../helpers/api';
import type { CommunityDto } from '../../models/communities/CommunityDto';

export interface ICommunityApiService {
    getPublic(): Promise<ApiResponse<CommunityDto[]>>;
    getMine(): Promise<ApiResponse<CommunityDto[]>>;
    getAll(): Promise<ApiResponse<CommunityDto[]>>;
    getById(id: number): Promise<ApiResponse<CommunityDto>>;
    getUserCommunities(userId: number): Promise<ApiResponse<CommunityDto[]>>;
    search(query: string): Promise<ApiResponse<CommunityDto[]>>;
    create(data: { name: string; description?: string; rules?: string; avatar?: string; type: string }): Promise<ApiResponse<CommunityDto>>;
    update(id: number, data: { name: string; description?: string; rules?: string; avatar?: string; type: string }): Promise<ApiResponse<CommunityDto>>;
    remove(id: number): Promise<ApiResponse<boolean>>;
    join(id: number): Promise<ApiResponse<boolean>>;
    leave(id: number): Promise<ApiResponse<boolean>>;
}