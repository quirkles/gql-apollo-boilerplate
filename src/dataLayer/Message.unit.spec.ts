import { MessageDataSource } from './Message';
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
    Message: 'Message',
}));

const getMockDbConnection = () => {
    const repositories: Record<string, Record<string, jest.Mock>> = {
        User: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        },
        Message: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        },
    };
    return {
        getRepository: jest.fn((entityType: string) => repositories[entityType]),
    };
};

describe('MessageDataSource', () => {
    let dataStoreMockInstance: TestDataStore;
    beforeAll(() => {
        const ds = new DataStore() as unknown;
        dataStoreMockInstance = ds as TestDataStore;
    });
    beforeEach(() => {
        dataStoreMockInstance.resetMocks();
    });
    describe('findById', () => {
        it('calls the message repository if there is not matching id in the datastore, returns what it does', async () => {
            const mockDbConnection = getMockDbConnection();
            const messageRepository = mockDbConnection.getRepository('Message');
            messageRepository.findOne.mockResolvedValue({ text: 'hello', id: 'abcd' });
            const messageDataSource = new MessageDataSource(mockDbConnection as never);
            const result = await messageDataSource.findById('abcd');
            expect(result).toEqual({ text: 'hello', id: 'abcd' });
            expect(dataStoreMockInstance.retrieveRecordById).toHaveBeenCalledWith('abcd');
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledWith({ text: 'hello', id: 'abcd' });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledTimes(1);
            expect(messageRepository.findOne).toHaveBeenCalledWith({ id: 'abcd' });
            expect(messageRepository.findOne).toHaveBeenCalledTimes(1);
        });
        it('does not call the message repository if there is a matching id in the datastore, returns what it does', async () => {
            const mockDbConnection = getMockDbConnection();
            const messageRepository = mockDbConnection.getRepository('Message');
            const messageDataSource = new MessageDataSource(mockDbConnection as never);
            dataStoreMockInstance.retrieveRecordById.mockReturnValue({ text: 'hello hello', id: 'xyz' });
            const result = await messageDataSource.findById('xyz');
            expect(result).toEqual({ text: 'hello hello', id: 'xyz' });
            expect(dataStoreMockInstance.retrieveRecordById).toHaveBeenCalledWith('xyz');
            expect(dataStoreMockInstance.insertRecord).not.toHaveBeenCalled();
            expect(messageRepository.findOne).not.toHaveBeenCalled();
        });
        it('calls the message repository if there is no matching id in the datastore, does not call the repository again if queried for the same id before that promise resolved', async () => {
            const mockDbConnection = getMockDbConnection();
            const messageRepository = mockDbConnection.getRepository('Message');
            const messageDataSource = new MessageDataSource(mockDbConnection as never);
            messageRepository.findOne.mockResolvedValue({ text: 'another_message', id: '1234' });
            const promise_1 = messageDataSource.findById('1234');
            const promise_2 = messageDataSource.findById('1234');
            const promise_3 = messageDataSource.findById('1234');
            const [result_1, result_2, result_3] = await Promise.all([promise_1, promise_2, promise_3]);
            expect(result_1).toEqual({ text: 'another_message', id: '1234' });
            expect(result_2).toEqual({ text: 'another_message', id: '1234' });
            expect(result_3).toEqual({ text: 'another_message', id: '1234' });
            expect(dataStoreMockInstance.retrieveRecordById).toHaveBeenCalledWith('1234');
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledWith({ text: 'another_message', id: '1234' });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledTimes(1);
            expect(messageRepository.findOne).toHaveBeenCalledWith({ id: '1234' });
            expect(messageRepository.findOne).toHaveBeenCalledTimes(1);
        });
    });
    describe('create', () => {
        it('it calls create on the messageRepository, attempts to save that entity, returns the saved entity if successful', async () => {
            const mockDbConnection = getMockDbConnection();
            const messageRepository = mockDbConnection.getRepository('Message');
            messageRepository.create.mockReturnValue({ text: 'message text' });
            messageRepository.save.mockResolvedValue({ id: '123', text: 'message text' });
            const messageDataSource = new MessageDataSource(mockDbConnection as never);
            dataStoreMockInstance.insertRecord.mockImplementation((thing) => thing);
            const result = await messageDataSource.create({ text: 'message text' });
            expect(result).toEqual({ id: '123', text: 'message text' });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledWith({ id: '123', text: 'message text' });
            expect(dataStoreMockInstance.insertRecord).toHaveBeenCalledTimes(1);
            expect(messageRepository.create).toHaveBeenCalledWith({ text: 'message text' });
            expect(messageRepository.create).toHaveBeenCalledTimes(1);
            expect(messageRepository.save).toHaveBeenCalledWith({ text: 'message text' });
            expect(messageRepository.create).toHaveBeenCalledTimes(1);
        });
    });
});
