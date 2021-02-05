import { UserDataSource } from './User';
import { MessageDataSource } from './Message';

import { ConnectionMap } from '../database/createConnection';

type DataSources = {
    user: UserDataSource;
    message: MessageDataSource;
};

export class DataSourceManager {
    private readonly dataSources: DataSources = {} as DataSources;
    constructor(connectionMap: ConnectionMap) {
        const { gqlSql } = connectionMap;
        this.dataSources['user'] = new UserDataSource(gqlSql);
        this.dataSources['message'] = new MessageDataSource(gqlSql);
    }

    public getDataSourceForEntity<T extends keyof DataSources>(entityName: T): DataSources[T] {
        const dataSource = this.dataSources[entityName];
        if (dataSource) {
            return dataSource;
        }
        throw new Error(`Attempted to retrieve non existent data source: ${entityName}`);
    }
}
