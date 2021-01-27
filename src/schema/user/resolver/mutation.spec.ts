import { getRepository } from 'typeorm';

import Mutation from './mutation';
import { AppContext } from '../../../appContext';
import { GenericErrorResponse } from '../../shared/responses';

jest.mock('typeorm', () => ({
    getRepository: jest.fn(),
}));

jest.mock('../../../database/entities', () => ({
    User: 'UserEntity',
}));

describe('user mutations', () => {
    describe('createUser', () => {
        it('returns an error response when there is a pre-existing user', async () => {
            const findOne = jest.fn(() => ({
                username: 'taken',
            }));
            (getRepository as jest.Mock).mockReturnValue({
                findOne,
            });
            const result = await Mutation.createUser(
                undefined,
                { username: 'taken', password: 'passy' },
                {} as AppContext,
            );
            expect(getRepository).toBeCalledWith('UserEntity');
            expect(findOne).toBeCalledWith({ username: 'taken' });
            expect(result).toEqual(new GenericErrorResponse('The username is taken'));
        });
    });
});
