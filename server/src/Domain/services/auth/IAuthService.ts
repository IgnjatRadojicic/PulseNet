import { UserAuthDataDto } from '../../DTOs/auth/UserAuthDataDto';
import { ServiceResult } from '../../types/ServiceResult';

export interface IAuthService {
    login(username: string, password: string): Promise<ServiceResult<UserAuthDataDto>>;
    register(
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        password: string,
        bio?: string,
        profileImage?: string
    ): Promise<ServiceResult<UserAuthDataDto>>;
}