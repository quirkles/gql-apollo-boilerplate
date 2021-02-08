import { Connection, Repository } from 'typeorm';
import { Message } from '../database/entities';
import { DataStore } from './dataStore';

export class MessageDataSource {
    private dataStore: DataStore<Message>;
    private messageRepository: Repository<Message>;
    private requests: Record<string, Promise<Message | undefined> | undefined> = {};
    constructor(dbConnection: Connection) {
        this.messageRepository = dbConnection.getRepository(Message);
        this.dataStore = new DataStore<Message>();
    }

    public findById(id: string): Promise<Message | undefined> {
        const entityFromStore = this.dataStore.retrieveRecordById(id);
        const pendingResponse = this.requests[id];
        if (entityFromStore) {
            return Promise.resolve(entityFromStore);
        } else if (pendingResponse) {
            return pendingResponse;
        } else {
            const promise = this.messageRepository.findOne({ id });
            this.requests[id] = promise;
            return promise.then((message) => {
                if (message) {
                    this.dataStore.insertRecord(message);
                }
                this.requests[id] = undefined;
                return message;
            });
        }
    }
}
