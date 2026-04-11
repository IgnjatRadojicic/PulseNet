export interface CommunityDto {
    id: number;
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    type: 'public' | 'private';
    creatorId: number;
    memberCount: number;
    createdAt: string | null;
}