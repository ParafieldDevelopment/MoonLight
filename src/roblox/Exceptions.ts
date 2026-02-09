export class UnknownRequestException extends Error {
    detail: string;

    constructor(detail: string) {
        super(`Unknown Request Exception: ${detail}`);
        this.detail = detail;
        this.name = "UnknownRequestException";
    }
}
