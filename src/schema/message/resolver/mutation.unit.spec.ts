import messageMutationResolver from './mutation';
import { UserDataSource } from '../../../dataLayer/User';
import { MessageDataSource } from '../../../dataLayer/Message';
import { GenericErrorResponse, UnauthorizedRequestResponse } from '../../shared/responses';

jest.mock('../../shared/responses', () => ({
    GenericErrorResponse: jest.fn().mockImplementation((message, reason) => ({ message, reason })),
    UnauthorizedRequestResponse: jest.fn().mockImplementation(() => ({ message: 'unauthorized' })),
}));

const getTestContext = () => {
    const userDataSource = {
        findById: jest.fn((id) => Promise.resolve({ id })),
    };
    const messageDataSource = {
        findById: jest.fn((id) => Promise.resolve({ id })),
        create: jest.fn((msg) => Promise.resolve({ ...msg, created: true })),
    };

    return {
        logger: {
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
        },
        dataSource: {
            getDataSourceForEntity: jest.fn((entityName) => {
                switch (entityName) {
                    case 'user':
                        return userDataSource;
                    case 'message':
                        return messageDataSource;
                }
            }),
        },
    };
};

describe('messageMutationResolver', () => {
    describe('createMessage', () => {
        it('returns the created message if everything goes right', async () => {
            const parent = undefined;
            const context = {
                ...getTestContext(),
                user: {
                    id: `sender_id`,
                },
            };
            const args = {
                input: {
                    recipientId: 'recipient_id',
                    messageText: 'hello',
                },
            };
            const userDataSource: unknown = context.dataSource.getDataSourceForEntity('user');
            const messageDataSource: unknown = context.dataSource.getDataSourceForEntity('message');
            const result = await messageMutationResolver.createMessage(parent, args, context as never);
            expect(result).toEqual({
                created: true,
                recipient: {
                    id: 'recipient_id',
                },
                sender: {
                    id: 'sender_id',
                },
                text: 'hello',
            });
            expect((userDataSource as UserDataSource).findById).toHaveBeenCalledTimes(2);
            expect((userDataSource as UserDataSource).findById).toHaveBeenCalledWith('sender_id');
            expect((userDataSource as UserDataSource).findById).toHaveBeenCalledWith('recipient_id');
            expect((messageDataSource as MessageDataSource).create).toHaveBeenCalledTimes(1);
        });
        it('returns the expected error message if the call to fetch recipient data fails', async () => {
            const parent = undefined;
            const context = {
                ...getTestContext(),
                user: {
                    id: `sender_id`,
                },
            };
            const args = {
                input: {
                    recipientId: 'recipient_id',
                    messageText: 'hello',
                },
            };
            const userDataSource: unknown = context.dataSource.getDataSourceForEntity('user');

            ((userDataSource as UserDataSource).findById as jest.Mock).mockImplementation((id) => {
                if (id === 'recipient_id') {
                    return Promise.reject(new Error('ooooops!'));
                }
                return Promise.resolve({ id });
            });

            const result = await messageMutationResolver.createMessage(parent, args, context as never);

            expect(result).toEqual(new GenericErrorResponse('Could not create message', 'ooooops!'));
        });
        it('returns the expected error message if the call to fetch sender data fails', async () => {
            const parent = undefined;
            const context = {
                ...getTestContext(),
                user: {
                    id: `sender_id`,
                },
            };
            const args = {
                input: {
                    recipientId: 'recipient_id',
                    messageText: 'hello',
                },
            };
            const userDataSource: unknown = context.dataSource.getDataSourceForEntity('user');

            ((userDataSource as UserDataSource).findById as jest.Mock).mockImplementation((id) => {
                if (id === 'sender_id') {
                    return Promise.reject(new Error('dang!'));
                }
                return Promise.resolve({ id });
            });

            const result = await messageMutationResolver.createMessage(parent, args, context as never);

            expect(result).toEqual(new GenericErrorResponse('Could not create message', 'dang!'));
        });
        it('returns the expected error message if no recipient is found', async () => {
            const parent = undefined;
            const context = {
                ...getTestContext(),
                user: {
                    id: `sender_id`,
                },
            };
            const args = {
                input: {
                    recipientId: 'recipient_id',
                    messageText: 'hello',
                },
            };
            const userDataSource: unknown = context.dataSource.getDataSourceForEntity('user');

            ((userDataSource as UserDataSource).findById as jest.Mock).mockImplementation((id) => {
                if (id === 'recipient_id') {
                    return Promise.resolve(undefined);
                }
                return Promise.resolve({ id });
            });

            const result = await messageMutationResolver.createMessage(parent, args, context as never);

            expect(result).toEqual(
                new GenericErrorResponse('Could not create message', 'Could not locate the specified recipient'),
            );
        });
        it('returns the expected error message if no user is present on the context', async () => {
            const parent = undefined;
            const context = getTestContext();
            const args = {
                input: {
                    recipientId: 'recipient_id',
                    messageText: 'hello',
                },
            };
            const userDataSource: unknown = context.dataSource.getDataSourceForEntity('user');

            ((userDataSource as UserDataSource).findById as jest.Mock).mockImplementation((id) => {
                if (id === 'recipient_id') {
                    return Promise.resolve(undefined);
                }
                return Promise.resolve({ id });
            });

            const result = await messageMutationResolver.createMessage(parent, args, context as never);

            expect(result).toEqual(new UnauthorizedRequestResponse());
        });
    });
});
