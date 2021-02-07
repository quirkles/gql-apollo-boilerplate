import { Connection, Repository } from 'typeorm';
import { User } from '../database/entities';
import { DataStore } from './dataStore';
import { MutationCreateUserArgs } from '../types';

export class UserDataSource {
    private dataStore: DataStore<User>;
    private userRepository: Repository<User>;
    private requests: Record<string, Promise<User | User[] | undefined> | undefined> = {};
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
            return pendingResponse as Promise<User | undefined>;
        } else {
            const promise = this.userRepository.findOne({ id });
            this.requests[id] = promise;
            return promise.then((user) => {
                if (user) {
                    this.dataStore.insertRecord(user);
                }
                this.requests[id] = undefined;
                return user;
            });
        }
    }
    public findByParams(params: Partial<User>): Promise<User[] | undefined> {
        const entitiesFromStore = this.dataStore.retrieveMatchingRecords(params);
        const requestId = JSON.stringify(params);
        const pendingResponse = this.requests[requestId];
        if (entitiesFromStore.length) {
            return Promise.resolve(entitiesFromStore);
        } else if (pendingResponse) {
            return pendingResponse as Promise<User[]>;
        } else {
            const promise = this.userRepository.find(params);
            this.requests[requestId] = promise;
            promise.then((users) => {
                if (users && users.length) {
                    this.dataStore.insertRecords(users);
                }
                this.requests[requestId] = undefined;
            });
            return promise;
        }
    }
    public create(params: MutationCreateUserArgs): Promise<User> {
        const user = this.userRepository.create(params);
        return this.userRepository.save(user).then((savedUser) => {
            return this.dataStore.insertRecord(savedUser);
        });
    }
}
