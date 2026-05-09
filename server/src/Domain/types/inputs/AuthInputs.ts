export type LoginInput = {
    username: string;
    password: string;
};

export type RegisterInput = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    bio?: string;
    profileImage?: string;
};
