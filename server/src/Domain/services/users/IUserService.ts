import { UserDto } from '../../DTOs/users/UserDto';
import { ServiceResult } from '../../types/ServiceResult';

export interface IUserService {
    getAllUsers(): Promise<ServiceResult<UserDto[]>>;
    getUserById(id: number): Promise<ServiceResult<UserDto>>;
    updateProfile(
        id: number,
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        bio?: string,
        profileImage?: string
    ): Promise<ServiceResult<UserDto>>;
    updateRole(id: number, role: string): Promise<ServiceResult<boolean>>;
    searchUsers(query: string): Promise<ServiceResult<UserDto[]>>;
    followUser(followerId: number, followingId: number): Promise<ServiceResult<boolean>>;
    unfollowUser(followerId: number, followingId: number): Promise<ServiceResult<boolean>>;
    getFollowers(id: number): Promise<ServiceResult<UserDto[]>>;
    getFollowing(id: number): Promise<ServiceResult<UserDto[]>>;
}