export const generateRandomOTP = (length: number = 6): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return otp;
};

export const generateUsername = (name: string | undefined): string => {
    const usernamePart = name ? name.split(' ')[0] : "user";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${usernamePart}${randomSuffix}`;
};