import { GenericError } from '../../types';

export interface ResponseType {
    readonly responseType: string;
}

export class GenericErrorResponse implements ResponseType, GenericError {
    readonly responseType = 'GenericError';

    readonly message: string;

    readonly reason: string;

    constructor(message: string, reason: string) {
        this.message = message;
        this.reason = reason;
    }
}
