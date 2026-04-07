export class Comment {
    public constructor(
        public id: number = 0,
        public postId: number = 0,
        public authorId: number = 0,
        public parentId: number | null = null,
        public commentLikes: number = 0,
        public replies: Comment[] = [],
        public content: string = '',
        public isDeleted: boolean = false,
        public isFlagged: boolean = false,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) {}
}