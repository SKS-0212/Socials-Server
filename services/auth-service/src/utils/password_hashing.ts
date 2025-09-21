import bcrypt from "bcrypt"

const SALT_ROUND = 10;

export const hashPassword = (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUND);
}

export const comparePassword = (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
}