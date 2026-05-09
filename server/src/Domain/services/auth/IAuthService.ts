import { UserAuthDataDto } from '../../DTOs/auth/UserAuthDataDto';
import { ServiceResult } from '../../types/ServiceResult';
import { LoginInput, RegisterInput } from '../../types/inputs/AuthInputs';

export interface IAuthService {
    login(input: LoginInput): Promise<ServiceResult<UserAuthDataDto>>;
    register(input: RegisterInput): Promise<ServiceResult<UserAuthDataDto>>;
}
