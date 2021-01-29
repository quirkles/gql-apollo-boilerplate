import { getRepository } from 'typeorm';

import Mutation from './mutation';
import { AppContext } from '../../../appContext';
import { GenericErrorResponse } from '../../shared/responses';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn((payload) => `token: ${JSON.stringify(payload)}`),
}));

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
            const save = jest.fn();
            const create = jest.fn(() => ({
                save,
            }));
            (getRepository as jest.Mock).mockReturnValue({
                findOne,
                create,
            });
            const result = await Mutation.createUser(
                undefined,
                { username: 'taken', password: 'passy' },
                {} as AppContext,
            );
            expect(getRepository).toBeCalledWith('UserEntity');
            expect(findOne).toBeCalledWith({ username: 'taken' });
            expect(result).toEqual(new GenericErrorResponse('Failed to create user', 'The username is taken'));
            expect(create).not.toHaveBeenCalled();
        });
        it('returns an error response when the save fails', async () => {
            const findOne = jest.fn(() => null);
            const save = jest.fn().mockRejectedValue(new Error('something went wrong!'));
            const create = jest.fn(() => ({
                save,
            }));
            (getRepository as jest.Mock).mockReturnValue({
                findOne,
                create,
            });
            const result = await Mutation.createUser(
                undefined,
                { username: 'free', password: 'passy' },
                {} as AppContext,
            );
            expect(getRepository).toBeCalledWith('UserEntity');
            expect(findOne).toBeCalledWith({ username: 'free' });
            expect(result).toEqual(new GenericErrorResponse('Failed to create user', 'something went wrong!'));
            expect(create).toHaveBeenCalledWith({ username: 'free', password: 'passy' });
            expect(save).toHaveBeenCalled();
        });
        it('returns a user and token if everything works', async () => {
            const findOne = jest.fn(() => null);
            const save = jest.fn().mockResolvedValue(true);
            const create = jest.fn((args) => ({
                ...args,
                save,
            }));
            (getRepository as jest.Mock).mockReturnValue({
                findOne,
                create,
            });
            const result = await Mutation.createUser(
                undefined,
                { username: 'free', password: 'passy' },
                {} as AppContext,
            );
            expect(getRepository).toBeCalledWith('UserEntity');
            expect(findOne).toBeCalledWith({ username: 'free' });
            expect(create).toHaveBeenCalledWith({ username: 'free', password: 'passy' });
            expect(save).toHaveBeenCalled();
            expect(result).toEqual({
                token: 'token: {"username":"free"}',
                user: {
                    password: 'passy',
                    save,
                    username: 'free',
                },
            });
        });
    });
});
