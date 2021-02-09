import { MessageDataSource } from '../../../dataLayer/Message';
import { GenericErrorResponse } from '../../shared/responses';
import messageQueryResolver from './query';

jest.mock('../../shared/responses', () => ({
    GenericErrorResponse: jest.fn().mockImplementation((message, reason) => ({ message, reason })),
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

describe('messageQueryResolver', () => {
    describe('message', () => {
        it('returns the found message if everything goes right', async () => {
            const parent = undefined;
            const context = {
                ...getTestContext(),
                user: {
                    id: `sender_id`,
                },
            };
            const args = {
                messageId: 'message_id',
            };
            const messageDataSource: unknown = context.dataSource.getDataSourceForEntity('message');
            ((messageDataSource as MessageDataSource).findById as jest.Mock).mockImplementation((id) => ({
                id,
                text: 'hello hello',
            }));
            const result = await messageQueryResolver.message(parent, args, context as never);
            expect(result).toEqual({
                id: 'message_id',
                text: 'hello hello',
            });
            expect((messageDataSource as MessageDataSource).findById).toHaveBeenCalledTimes(1);
            expect((messageDataSource as MessageDataSource).findById).toHaveBeenCalledWith('message_id');
        });
        it('returns the expected error message if the call to fetch message data fails', async () => {
            const parent = undefined;
            const context = getTestContext();
            const args = {
                messageId: 'message_id',
            };
            const messageDataSource: unknown = context.dataSource.getDataSourceForEntity('message');

            ((messageDataSource as MessageDataSource).findById as jest.Mock).mockRejectedValue(
                new Error('it blew up the server!'),
            );

            const result = await messageQueryResolver.message(parent, args, context as never);

            expect(result).toEqual(new GenericErrorResponse('Could not find message', 'it blew up the server!'));
        });
        it('returns the expected error message if the call to fetch message data does not return a message', async () => {
            const parent = undefined;
            const context = getTestContext();
            const args = {
                messageId: 'message_id',
            };
            const messageDataSource: unknown = context.dataSource.getDataSourceForEntity('message');

            ((messageDataSource as MessageDataSource).findById as jest.Mock).mockResolvedValue(undefined);

            const result = await messageQueryResolver.message(parent, args, context as never);

            expect(result).toEqual(new GenericErrorResponse('Could not find message'));
        });
    });
});
