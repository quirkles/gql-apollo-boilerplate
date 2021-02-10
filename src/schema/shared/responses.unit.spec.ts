import { GenericErrorResponse, UnauthorizedRequestResponse } from './responses';

describe('shared responses', () => {
    describe('GenericErrorResponse', () => {
        it('has the expected properties, no reason provided', () => {
            const error = new GenericErrorResponse('something went wrong');
            expect(JSON.parse(JSON.stringify(error))).toEqual({
                message: 'something went wrong',
                responseType: 'GenericError',
            });
        });
        it('has the expected properties, with a reason provided', () => {
            const error = new GenericErrorResponse('something went wrong', 'and this is why');
            expect(JSON.parse(JSON.stringify(error))).toEqual({
                message: 'something went wrong',
                reason: 'and this is why',
                responseType: 'GenericError',
            });
        });
    });

    describe('UnauthorizedRequestResponse', () => {
        it('has the expected properties', () => {
            const error = new UnauthorizedRequestResponse();
            expect(JSON.parse(JSON.stringify(error))).toEqual({
                message: 'You must be logged in to perform this query or mutation',
                responseType: 'UnauthorizedRequest',
            });
        });
    });
});
