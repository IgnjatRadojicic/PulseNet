export interface UserDto {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImage: string | null;
    role: string;
}

export interface AdminUserDto {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImage: string | null;
    role: string;
}