type AccessTokenErrorCode =
    | 'ACCESS_TOKEN_REQUIRED'
    | 'ACCESS_TOKEN_INVALID'
    | 'ACCESS_TOKEN_EXPIRED';

export class AccessTokenError extends Error {
    readonly code: AccessTokenErrorCode;

    constructor(code: AccessTokenErrorCode, message: string) {
        super(message);
        this.code = code;
    }
}
