export const isJWT = (token: string): boolean => {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }
    try {
        return parts.every((part) => {
            const decoded = Buffer.from(part, 'base64').toString('utf-8');
            return !!decoded;
        });
    } catch (error) {
        return false;
    }
};
