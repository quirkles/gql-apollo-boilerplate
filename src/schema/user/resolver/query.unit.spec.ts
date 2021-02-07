import Query from './query';
import { GenericErrorResponse } from '../../shared/responses';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn((payload) => `token: ${JSON.stringify(payload)}`),
}));

jest.mock('../../shared/responses', () => ({
    GenericErrorResponse: jest.fn().mockImplementation((message, reason) => ({ message, reason })),
}));

jest.mock('../../../encrypt', () => ({
    encrypt: jest.fn((string) => string),
}));

const getTestContext = () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
    },
    dataSource: {
        getDataSourceForEntity: jest.fn(),
    },
});

describe('user queries', () => {
    describe('user', () => {
        it('returns user if one is found', async () => {
            const context = getTestContext();
            const findByIdMock = jest.fn().mockResolvedValue({ id: 'abcd', username: 'quirkles' });
            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return {
                            findById: findByIdMock,
                        } as never;
                    default:
                        return {} as never;
                }
            });
            const response = await Query.user(undefined, { userId: 'abcd' }, context as never);
            expect(response).toEqual({
                id: 'abcd',
                username: 'quirkles',
            });
            expect(findByIdMock).toHaveBeenCalledWith('abcd');
        });
        it('returns error if no user is found', async () => {
            const context = getTestContext();
            const findByIdMock = jest.fn().mockResolvedValue(null);
            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return {
                            findById: findByIdMock,
                        } as never;
                    default:
                        return {} as never;
                }
            });
            const response = await Query.user(undefined, { userId: 'abcd' }, context as never);
            expect(response).toEqual(new GenericErrorResponse('Could not find user'));
            expect(findByIdMock).toHaveBeenCalledWith('abcd');
        });
        it('returns error if no call to fetch it fails', async () => {
            const context = getTestContext();
            const findByIdMock = jest.fn().mockRejectedValue(new Error('service is down!'));
            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return {
                            findById: findByIdMock,
                        } as never;
                    default:
                        return {} as never;
                }
            });
            const response = await Query.user(undefined, { userId: 'abcd' }, context as never);
            expect(response).toEqual(new GenericErrorResponse('Could not find user', 'service is down!'));
            expect(findByIdMock).toHaveBeenCalledWith('abcd');
        });
    });
});
