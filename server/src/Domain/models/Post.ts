export class Post {
    public constructor(
        public id: number = 0,
        public title: string = '',
        public content: string = '',
        public mediaUrl: string | null = null,
        public communityId: number = 0,
        public authorId: number = 0,
        public createdAt: Date | null = null,
        public updatedAt: Date | null = null
    ) {}
}