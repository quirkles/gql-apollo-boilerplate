import { Connection, Repository } from 'typeorm';
import { User } from '../database/entities';
import { DataStore } from './dataStore';

export class UserDataSource {
    private dataStore: DataStore<User>;
    private userRepository: Repository<User>;
    private requests: Record<string, Promise<User | undefined> | undefined> = {};
    constructor(dbConnection: Connection) {
        this.userRepository = dbConnection.getRepository(User);
        this.dataStore = new DataStore<User>();
    }

    public findById(id: string): Promise<User | undefined> {
        const entityFromStore = this.dataStore.retrieveRecordById(id);
        const pendingResponse = this.requests[id];
        if (entityFromStore) {
            return Promise.resolve(entityFromStore);
        } else if (pendingResponse) {
            return pendingResponse;
        } else {
            const promise = this.userRepository.findOne({ id });
            this.requests[id] = promise;
            promise.then((user) => {
                if (user) {
                    this.dataStore.insertRecord(user);
                }
                this.requests[id] = undefined;
            });
        }
        return this.userRepository.findOne({ id });
    }
}
