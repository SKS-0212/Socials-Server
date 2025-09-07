export interface IUser {
    name: string;
    username: string;
    password: string;
    refreshToken: string;
    dob: string;
    email: string;
    profilePicture: {
        id: string;
        url: string;
    };
    avatar: {
        id: string;
        url: string;
    };
    bio: string;
    mobileNumber: String;
    isActive: boolean;
    isPrivate: boolean;
    isBlocked: boolean;
    coverImage: string;
    createdAt?: Date;
    updatedAt?: Date;
}