import { UserDataSource } from './User';
import { DataStore } from './dataStore';

interface TestDataStore {
    retrieveRecordById: jest.Mock;
    insertRecord: jest.Mock;
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
            const insertRecord = jest.fn();
            dataStore = {
                retrieveRecordById,
                insertRecord,
                resetMocks() {
                    retrieveRecordById.mockReset();
                    insertRecord.mockReset();
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
            console.log('mocking 3') //eslint-disable-line
            userRepository.findOne.mockResolvedValue({ username: 'another_user', id: '1234' });
            const promise_1 = userDataSource.findById('1234');
            const promise_2 = userDataSource.findById('1234');
            const promise_3 = userDataSource.findById('1234');
            const [result_1, result_2, result_3] = await Promise.all([promise_1, promise_2, promise_3]);
            console.log('got results') //eslint-disable-line
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
    describe.skip('findByParams', () => {
        it('calls the user repository if there are no matching id in the datastore, returns what it does', async () => {
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
            console.log('mocking 3') //eslint-disable-line
            userRepository.findOne.mockResolvedValue({ username: 'another_user', id: '1234' });
            const promise_1 = userDataSource.findById('1234');
            const promise_2 = userDataSource.findById('1234');
            const promise_3 = userDataSource.findById('1234');
            const [result_1, result_2, result_3] = await Promise.all([promise_1, promise_2, promise_3]);
            console.log('got results') //eslint-disable-line
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
});
