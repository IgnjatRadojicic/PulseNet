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

export interface UserProfileDto {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImage: string | null;
    role: string;
    createdAt: Date;
    stats: {
        postCount: number;
        commentCount: number;
        followerCount: number;
        followingCount: number;
    };
    isFollowing: boolean;
}

export interface UpdateProfileDto {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio?: string | null;
    profileImage?: string | null;
    password?: string;
}

export interface UserActivityDto {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    createdAt: Date;
}

export interface UserCommunityDto {
    id: number;
    name: string;
    description: string | null;
    memberCount: number;
    role: string;
}