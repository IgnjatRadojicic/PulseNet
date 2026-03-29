export class UserAuthDataDto {
    public constructor(
        public id: number = 0,
        public username: string = '',
        public email: string = '',
        public role: string = 'user'
    ) {}
}