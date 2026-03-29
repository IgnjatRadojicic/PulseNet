export class User {
  public constructor(
        public id: number = 0,
        public username: string = '',
        public email: string = '',
        public name: string = '',
        public lastname: string = '',
        public bio: string | null = null,
        public profilePicture: string | null = null, 
        public role: string = 'user',
        public password: string = ''
  ) {}
}