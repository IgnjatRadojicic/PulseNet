export interface PostDto {
    id: number;
    title: string;
    content: string;
    mediaUrl: string | null;
    communityId: number;
    communityName: string;
    authorId: number;
    authorUsername: string;
    likeCount: number;
    commentCount: number;
    tags: string[];
    createdAt: string | null;
    updatedAt: string | null;
}