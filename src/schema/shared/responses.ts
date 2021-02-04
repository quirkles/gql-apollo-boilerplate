import { GenericError, UnauthorizedRequest } from '../../types';

export interface ResponseType {
    readonly responseType: string;
}

export class GenericErrorResponse implements ResponseType, GenericError {
    readonly responseType = 'GenericError';

    readonly message: string;

    readonly reason?: string;

    constructor(message: string, reason?: string) {
        this.message = message;
        if (reason) {
            this.reason = reason;
        }
    }
}

export class UnauthorizedRequestResponse implements ResponseType, UnauthorizedRequest {
    readonly responseType = 'UnauthorizedRequest';

    readonly message = 'You must be logged in to perform this query or mutation';
}
