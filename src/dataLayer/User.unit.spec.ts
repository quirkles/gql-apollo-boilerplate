import { UserDataSource } from './User';
import { DataStore } from './dataStore';

interface TestDataStore {
    retrieveRecordById: jest.Mock;
    retrieveMatchingRecords: jest.Mock;
    insertRecord: jest.Mock;
    insertRecords: jest.Mock;
    resetMocks: () => void;
}

jest.mock('./dataStore', () => {
    let dataStore: TestDataStore;
    return {
        DataStore: function DataStore() {
            if (dataStore) {
                return dataStore;
            }
            const retrieveRecordById = jest.fn();
            const retrieveMatchingRecords = jest.fn();
            const insertRecord = jest.fn();
            const insertRecords = jest.fn();
            dataStore = {
                retrieveRecordById,
                retrieveMatchingRecords,
                insertRecord,
                insertRecords,
                resetMocks() {
                    retrieveMatchingRecords.mockReset();
                    retrieveRecordById.mockReset();
                    insertRecord.mockReset();
                    insertRecords.mockReset();
                },
            };
            return dataStore;
        },
    };
});

jest.mock('../database/entities', () => ({
    User: 'User',
}));

const getMockDbConnection = () => {
    const repositories: Record<string, Record<string, jest.Mock>> = {
        User: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        },
    };
    return {
        getRepository: jest.fn((entityType: string) => repositories[entityType]),
    };
};

describe('UserDataSource', () => {
    let dataStoreMockInstance: TestDataStore;
    beforeAll(() => {
        const ds = new DataStore() as unknown;
        dataStoreMockInstance = ds as TestDataStore;
    });
    beforeEach(() => {
        dataStoreMockInstance.resetMocks();
    });
    describe('findById', () => {
        it('calls the user repository if there is not matching id in the datastore, returns what it does', async () => {
            const mockDbConnection = getMockDbConnection();
            const userRepository = mockDbConnection.getRepository('User');
            userRepository.findOne.mockResolvedValue({ username: 'quirkles', id: 'abcd' });
            const userDataSource = new UserDataSource(mockDbConnection as never);
            const result = await userDataSource.findById('abcd');
            expect(result).toEqual({ username: 'quirkles', id: 'abcd' });
            expect(dataStoreMockInstance.retrieveRecordById).toHaveBeenCalledWith('abcd');
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledWith({ username: 'quirkles', id: 'abcd' });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledTimes(1);
            expect(userRepository.findOne).toHaveBeenCalledWith({ id: 'abcd' });
            expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        });
        it('does not call the user repository if there is a matching id in the datastore, returns what it does', async () => {
            const mockDbConnection = getMockDbConnection();
            const userRepository = mockDbConnection.getRepository('User');
            const userDataSource = new UserDataSource(mockDbConnection as never);
            dataStoreMockInstance.retrieveRecordById.mockReturnValue({ username: 'the_user', id: 'xyz' });
            const result = await userDataSource.findById('xyz');
            expect(result).toEqual({ username: 'the_user', id: 'xyz' });
            expect(dataStoreMockInstance.retrieveRecordById).toHaveBeenCalledWith('xyz');
            expect(dataStoreMockInstance.insertRecord).not.toHaveBeenCalled();
            expect(userRepository.findOne).not.toHaveBeenCalled();
        });
        it('calls the user repository if there is no matching id in the datastore, does not call the repository again if queried for the same id before that promise resolved', async () => {
            const mockDbConnection = getMockDbConnection();
            const userRepository = mockDbConnection.getRepository('User');
            const userDataSource = new UserDataSource(mockDbConnection as never);
            userRepository.findOne.mockResolvedValue({ username: 'another_user', id: '1234' });
            const promise_1 = userDataSource.findById('1234');
            const promise_2 = userDataSource.findById('1234');
            const promise_3 = userDataSource.findById('1234');
            const [result_1, result_2, result_3] = await Promise.all([promise_1, promise_2, promise_3]);
            expect(result_1).toEqual({ username: 'another_user', id: '1234' });
            expect(result_2).toEqual({ username: 'another_user', id: '1234' });
            expect(result_3).toEqual({ username: 'another_user', id: '1234' });
            expect(dataStoreMockInstance.retrieveRecordById).toHaveBeenCalledWith('1234');
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledWith({ username: 'another_user', id: '1234' });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledTimes(1);
            expect(userRepository.findOne).toHaveBeenCalledWith({ id: '1234' });
            expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        });
    });
    describe('findByParams', () => {
        it('calls the user repository if there are no matching items in the datastore, returns what it does', async () => {
            const mockDbConnection = getMockDbConnection();
            const userRepository = mockDbConnection.getRepository('User');
            userRepository.find.mockResolvedValue([
                { username: 'quirkles', id: 'abcd' },
                { username: 'another_user', id: '1234' },
            ]);
            const userDataSource = new UserDataSource(mockDbConnection as never);
            const results = await userDataSource.findByParams({ username: 'something' });
            expect(results).toEqual([
                { username: 'quirkles', id: 'abcd' },
                { username: 'another_user', id: '1234' },
            ]);
            expect(dataStoreMockInstance.retrieveMatchingRecords).toHaveBeenCalledWith({ username: 'something' });
            expect(dataStoreMockInstance.insertRecords).toHaveBeenCalledWith([
                { username: 'quirkles', id: 'abcd' },
                { username: 'another_user', id: '1234' },
            ]);
            expect(dataStoreMockInstance.insertRecords).toHaveBeenCalledTimes(1);
            expect(userRepository.find).toHaveBeenCalledWith({ username: 'something' });
            expect(userRepository.find).toHaveBeenCalledTimes(1);
        });
        it('does not call the user repository if there is a matching id in the datastore, returns what it does', async () => {
            const mockDbConnection = getMockDbConnection();
            const userRepository = mockDbConnection.getRepository('User');
            const userDataSource = new UserDataSource(mockDbConnection as never);
            dataStoreMockInstance.retrieveMatchingRecords.mockReturnValue([{ username: 'the_user', id: 'xyz' }]);
            const result = await userDataSource.findByParams({ username: 'value' });
            expect(result).toEqual([{ username: 'the_user', id: 'xyz' }]);
            expect(dataStoreMockInstance.retrieveMatchingRecords).toHaveBeenCalledWith({ username: 'value' });
            expect(dataStoreMockInstance.insertRecord).not.toHaveBeenCalled();
            expect(userRepository.find).not.toHaveBeenCalled();
        });
        it('calls the user repository if there is no matching id in the datastore, does not call the repository again if queried for the same id before that promise resolved', async () => {
            const mockDbConnection = getMockDbConnection();
            const userRepository = mockDbConnection.getRepository('User');
            const userDataSource = new UserDataSource(mockDbConnection as never);
            userRepository.find.mockResolvedValue([{ username: 'another_user', id: '1234' }]);
            const promise_1 = userDataSource.findByParams({ id: '1234' });
            const promise_2 = userDataSource.findByParams({ id: '1234' });
            const promise_3 = userDataSource.findByParams({ id: '1234' });
            const [result_1, result_2, result_3] = await Promise.all([promise_1, promise_2, promise_3]);
            expect(result_1).toEqual([{ username: 'another_user', id: '1234' }]);
            expect(result_2).toEqual([{ username: 'another_user', id: '1234' }]);
            expect(result_3).toEqual([{ username: 'another_user', id: '1234' }]);
            expect(dataStoreMockInstance.retrieveMatchingRecords).toHaveBeenCalledWith({ id: '1234' });
            expect(dataStoreMockInstance.insertRecords).toHaveBeenCalledWith([
                { username: 'another_user', id: '1234' },
            ]);
            expect(dataStoreMockInstance.insertRecords).toHaveBeenCalledTimes(1);
            expect(userRepository.find).toHaveBeenCalledWith({ id: '1234' });
            expect(userRepository.find).toHaveBeenCalledTimes(1);
        });
    });
    describe('create', () => {
        it('it calls create on the userRepository, attempts to save that entity, returns the saved entity if successful', async () => {
            const mockDbConnection = getMockDbConnection();
            const userRepository = mockDbConnection.getRepository('User');
            userRepository.create.mockReturnValue({ username: 'quirkles', password: '1234', created: true });
            userRepository.save.mockResolvedValue({
                password: '1234',
                username: 'quirkles',
                created: true,
                saved: true,
            });
            const userDataSource = new UserDataSource(mockDbConnection as never);
            dataStoreMockInstance.insertRecord.mockImplementation((thing) => thing);
            const result = await userDataSource.create({ username: 'quirkles', password: '1234' });
            expect(result).toEqual({ password: '1234', username: 'quirkles', created: true, saved: true });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledWith({
                password: '1234',
                username: 'quirkles',
                created: true,
                saved: true,
            });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledTimes(1);
            expect(userRepository.create).toHaveBeenCalledWith({ username: 'quirkles', password: '1234' });
            expect(userRepository.create).toHaveBeenCalledTimes(1);
            expect(userRepository.save).toHaveBeenCalledWith({ username: 'quirkles', password: '1234', created: true });
            expect(userRepository.create).toHaveBeenCalledTimes(1);
        });
    });
});
