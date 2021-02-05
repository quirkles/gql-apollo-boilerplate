import Mutation from './mutation';
import { GenericErrorResponse } from '../../shared/responses';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn((payload) => `token: ${JSON.stringify(payload)}`),
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

describe('user mutations', () => {
    describe('createUser', () => {
        it('returns an error response when there is a pre-existing user', async () => {
            const context = getTestContext();
            const findByParamsMock = jest.fn().mockResolvedValue([{ id: '1' }]);
            const createMock = jest.fn();
            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return {
                            findByParams: findByParamsMock,
                            create: createMock,
                        } as never;
                    default:
                        return {} as never;
                }
            });
            const result = await Mutation.createUser(
                undefined,
                { username: 'taken', password: 'passy' },
                context as never,
            );
            expect(context.dataSource.getDataSourceForEntity).toBeCalledWith('user');
            expect(findByParamsMock).toBeCalledWith({ username: 'taken' });
            expect(result).toEqual(new GenericErrorResponse('Failed to create user', 'The username is taken'));
            expect(createMock).not.toHaveBeenCalled();
        });
        it('returns an error response when the save fails', async () => {
            const context = getTestContext();
            const findByParamsMock = jest.fn().mockResolvedValue([]);
            const createMock = jest.fn().mockRejectedValue(new Error('something went wrong!'));
            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return {
                            findByParams: findByParamsMock,
                            create: createMock,
                        } as never;
                    default:
                        return {} as never;
                }
            });
            const result = await Mutation.createUser(
                undefined,
                { username: 'free', password: 'passy' },
                context as never,
            );
            expect(context.dataSource.getDataSourceForEntity).toBeCalledWith('user');
            expect(findByParamsMock).toBeCalledWith({ username: 'free' });
            expect(result).toEqual(new GenericErrorResponse('Failed to create user', 'something went wrong!'));
            expect(createMock).toHaveBeenCalledWith({ username: 'free', password: 'passy' });
        });
        it('returns a user and token if everything works', async () => {
            const context = getTestContext();
            const findByParamsMock = jest.fn().mockResolvedValue([]);
            const createMock = jest.fn().mockReturnValue({ id: '1234' });
            context.dataSource.getDataSourceForEntity.mockImplementation((...args) => {
                const [entityName] = args as never[];
                switch (entityName) {
                    case 'user':
                        return {
                            findByParams: findByParamsMock,
                            create: createMock,
                        } as never;
                    default:
                        return {} as never;
                }
            });
            const result = await Mutation.createUser(
                undefined,
                { username: 'free', password: 'passy' },
                context as never,
            );
            expect(context.dataSource.getDataSourceForEntity).toBeCalledWith('user');
            expect(findByParamsMock).toBeCalledWith({ username: 'free' });
            expect(createMock).toHaveBeenCalledWith({ username: 'free', password: 'passy' });
            expect(result).toEqual({
                token: 'token: {"username":"free","sub":"1234"}',
                user: {
                    id: '1234',
                },
            });
        });
    });
});
