import type { AuthResponse } from '../../types/auth/AuthResponse';


export interface IAuthAPIService {
  login(username: string, password: string): Promise<AuthResponse>
  register(
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        password: string,
        bio?: string,
        profileImage?: string
    ): Promise<AuthResponse>;
    
    logout(token: string): Promise<void>;
   
}