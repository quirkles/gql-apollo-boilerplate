import { FieldResolver } from './fieldResolver';
import { GenericErrorResponse } from '../../shared/responses';

jest.mock('../../shared/responses', () => ({
    GenericErrorResponse: jest.fn().mockImplementation((message, reason) => ({ message, reason })),
}));

const getTestContext = () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
    },
    dataSource: {
        getDataSourceForEntity: jest.fn(() => {
            findById: jest.fn();
        }),
    },
});

type ResolverFn = (parent: unknown, args: unknown, context: unknown) => unknown;

describe('MessageFieldResolver', () => {
    describe('text field resolver', () => {
        const { text: textFieldResolver } = FieldResolver;
        it('returns the text if it is present on the parent entity', async () => {
            const parentEntity = { text: 'hello hello' };
            const args = {};
            const context = getTestContext();
            const result = await (textFieldResolver as ResolverFn)(parentEntity, args, context);
            expect(result).toBe('hello hello');
        });
        it('calls the datasource with the id of the parent if present and text is not, returns text of that entity', async () => {
            const parentEntity = { id: '1' };
            const args = {};
            const context = getTestContext();
            const findByIdMock = jest.fn(() => ({ text: 'hi!' }));
            context.dataSource.getDataSourceForEntity.mockReturnValue({ findById: findByIdMock } as never);
            const result = await (textFieldResolver as ResolverFn)(parentEntity, args, context);
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(1);
            expect(findByIdMock).toHaveBeenCalledWith('1');
            expect(findByIdMock).toHaveBeenCalledTimes(1);
            expect(result).toBe('hi!');
        });
        it('falls back to a default value of an empty string if it cant find a message', async () => {
            const parentEntity = { id: '1' };
            const args = {};
            const context = getTestContext();
            const findByIdMock = jest.fn(() => null);
            context.dataSource.getDataSourceForEntity.mockReturnValue({ findById: findByIdMock } as never);
            const result = await (textFieldResolver as ResolverFn)(parentEntity, args, context);
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(1);
            expect(findByIdMock).toHaveBeenCalledWith('1');
            expect(findByIdMock).toHaveBeenCalledTimes(1);
            expect(result).toBe('');
        });
        it('falls back to a default value of an empty string if the found message has no text', async () => {
            const parentEntity = { id: '1' };
            const args = {};
            const context = getTestContext();
            const findByIdMock = jest.fn(() => ({ text: null }));
            context.dataSource.getDataSourceForEntity.mockReturnValue({ findById: findByIdMock } as never);
            const result = await (textFieldResolver as ResolverFn)(parentEntity, args, context);
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(1);
            expect(findByIdMock).toHaveBeenCalledWith('1');
            expect(findByIdMock).toHaveBeenCalledTimes(1);
            expect(result).toBe('');
        });
        it('does not call the datasource if both id and text present, returns text of that entity', async () => {
            const parentEntity = { id: '1', text: 'howdy' };
            const args = {};
            const context = getTestContext();
            const findByIdMock = jest.fn(() => ({ text: 'hi!' }));
            context.dataSource.getDataSourceForEntity.mockReturnValue({ findById: findByIdMock } as never);
            const result = await (textFieldResolver as ResolverFn)(parentEntity, args, context);
            expect(context.dataSource.getDataSourceForEntity).not.toHaveBeenCalled();
            expect(findByIdMock).not.toHaveBeenCalled();
            expect(result).toBe('howdy');
        });
    });
    describe('sender field resolver', () => {
        const { sender: senderFieldResolver } = FieldResolver;
        it('returns the sender info if it is present on the parent entity', async () => {
            const sender = { username: 'the_sender' };
            const parentEntity = { sender };
            const args = {};
            const context = getTestContext();
            const result = await (senderFieldResolver as ResolverFn)(parentEntity, args, context);
            expect(result).toEqual(sender);
        });
        it('calls the datasource with the id of the parent if present and sender is not, returns sender of that entity', async () => {
            const parentEntity = { id: '1234' };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => ({ senderId: '99' }));
            const userFindByIdMock = jest.fn(() => ({ username: 'the_sender' }));

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (senderFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('user');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(2);
            expect(messageFindByIdMock).toHaveBeenCalledWith('1234');
            expect(messageFindByIdMock).toHaveBeenCalledTimes(1);
            expect(userFindByIdMock).toHaveBeenCalledWith('99');
            expect(userFindByIdMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ username: 'the_sender' });
        });
        it('falls back to empty object if no message is found, logs error', async () => {
            const parentEntity = { id: '1234' };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => null);
            const userFindByIdMock = jest.fn(() => ({ username: 'the_sender' }));

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (senderFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('user');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(2);
            expect(messageFindByIdMock).toHaveBeenCalledWith('1234');
            expect(messageFindByIdMock).toHaveBeenCalledTimes(1);
            expect(userFindByIdMock).not.toHaveBeenCalled();
            expect(context.logger.error).toHaveBeenCalledWith('Failed to find the message sender');
            expect(result).toEqual(new GenericErrorResponse('Could not find user'));
        });
        it('falls back to generic error if found message has no sender id', async () => {
            const parentEntity = { id: '1234' };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => ({
                senderId: null,
            }));
            const userFindByIdMock = jest.fn(() => ({ username: 'the_sender' }));

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (senderFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('user');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(2);
            expect(messageFindByIdMock).toHaveBeenCalledWith('1234');
            expect(messageFindByIdMock).toHaveBeenCalledTimes(1);
            expect(userFindByIdMock).not.toHaveBeenCalled();
            expect(context.logger.error).toHaveBeenCalledWith('Failed to find the message sender');
            expect(result).toEqual(new GenericErrorResponse('Could not find user'));
        });
        it('does not call the datasource if id and sender are present', async () => {
            const sender = { username: 'the_sender' };
            const parentEntity = { id: '1234', sender };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => ({ senderId: '99' }));
            const userFindByIdMock = jest.fn(() => sender);

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (senderFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).not.toHaveBeenCalled();
            expect(messageFindByIdMock).not.toHaveBeenCalled();
            expect(userFindByIdMock).not.toHaveBeenCalled();
            expect(result).toEqual({ username: 'the_sender' });
        });
    });
    describe('recipient field resolver', () => {
        const { recipient: recipientFieldResolver } = FieldResolver;
        it('returns the recipient info if it is present on the parent entity', async () => {
            const recipient = { username: 'the_recipient' };
            const parentEntity = { recipient };
            const args = {};
            const context = getTestContext();
            const result = await (recipientFieldResolver as ResolverFn)(parentEntity, args, context);
            expect(result).toEqual(recipient);
        });
        it('calls the datasource with the id of the parent if present and recipient is not, returns recipient of that entity', async () => {
            const parentEntity = { id: '1234' };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => ({ recipientId: '99' }));
            const userFindByIdMock = jest.fn(() => ({ username: 'the_recipient' }));

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (recipientFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('user');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(2);
            expect(messageFindByIdMock).toHaveBeenCalledWith('1234');
            expect(messageFindByIdMock).toHaveBeenCalledTimes(1);
            expect(userFindByIdMock).toHaveBeenCalledWith('99');
            expect(userFindByIdMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ username: 'the_recipient' });
        });
        it('falls back to empty object if no message is found, logs error', async () => {
            const parentEntity = { id: '1234' };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => null);
            const userFindByIdMock = jest.fn(() => ({ username: 'the_recipient' }));

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (recipientFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('user');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(2);
            expect(messageFindByIdMock).toHaveBeenCalledWith('1234');
            expect(messageFindByIdMock).toHaveBeenCalledTimes(1);
            expect(userFindByIdMock).not.toHaveBeenCalled();
            expect(context.logger.error).toHaveBeenCalledWith('Failed to find the message recipient');
            expect(result).toEqual(new GenericErrorResponse('Could not find user'));
        });
        it('falls back to empty object if found message has no recipient id', async () => {
            const parentEntity = { id: '1234' };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => ({
                recipientId: null,
            }));
            const userFindByIdMock = jest.fn(() => ({ username: 'the_recipient' }));

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (recipientFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('message');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledWith('user');
            expect(context.dataSource.getDataSourceForEntity).toHaveBeenCalledTimes(2);
            expect(messageFindByIdMock).toHaveBeenCalledWith('1234');
            expect(messageFindByIdMock).toHaveBeenCalledTimes(1);
            expect(userFindByIdMock).not.toHaveBeenCalled();
            expect(context.logger.error).toHaveBeenCalledWith('Failed to find the message recipient');
            expect(result).toEqual(new GenericErrorResponse('Could not find user'));
        });
        it('does not call the datasource if id and recipient are present', async () => {
            const recipient = { username: 'the_recipient' };
            const parentEntity = { id: '1234', recipient };
            const args = {};
            const context = getTestContext();

            const messageFindByIdMock = jest.fn(() => ({ recipientId: '99' }));
            const userFindByIdMock = jest.fn(() => recipient);

            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return { findById: userFindByIdMock } as never;
                    case 'message':
                        return { findById: messageFindByIdMock } as never;
                    default:
                        return {} as never;
                }
            });

            const result = await (recipientFieldResolver as ResolverFn)(parentEntity, args, context);

            expect(context.dataSource.getDataSourceForEntity).not.toHaveBeenCalled();
            expect(messageFindByIdMock).not.toHaveBeenCalled();
            expect(userFindByIdMock).not.toHaveBeenCalled();
            expect(result).toEqual({ username: 'the_recipient' });
        });
    });
});
