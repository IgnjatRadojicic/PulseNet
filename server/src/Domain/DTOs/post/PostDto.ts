export class PostDto {
    public constructor(
        public id: number = 0,
        public title: string = '',
        public content: string = '',
        public mediaUrl: string | null = null,
        public communityId: number = 0,
        public communityName: string = '',
        public authorId: number = 0,
        public authorUsername: string = '',
        public authorProfileImage: string | null = null,
        public isLiked: boolean = false,
        public likeCount: number = 0,
        public commentCount: number = 0,
        public tags: string[] = [],
        public createdAt: Date | null = null,
        public updatedAt: Date | null = null
    ) {}
}