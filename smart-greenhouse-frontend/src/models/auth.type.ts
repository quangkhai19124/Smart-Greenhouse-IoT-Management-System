export interface ISignInParams {
    email: string;
    password: string;
}

export interface IUserIdentity {
    email?: string;
    name?: string;
    role?: string;
    user?: {
        email?: string;
        name?: string;
        role?: string;
    };
    [key: string]: unknown;
}

export interface IUserProfile {
    id: number;
    username: string;
    email: string;
    role: string;
    teleChatID: string | null;
    avatar: string | null;
}