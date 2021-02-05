import { Connection, createConnection } from 'typeorm';
import { Logger } from 'pino';

import baseDbConfig from './connectionOptions.base';

export interface ConnectionMap {
    gqlSql: Connection;
}

export const initDbConnections = async (logger: Logger): Promise<ConnectionMap> => {
    const env = process.env.ENV || 'dev';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const envDbConfig = require(`./connectionOptions.${env}`).default;
    const dbConfig = {
        ...baseDbConfig,
        ...envDbConfig,
    };
    logger.info('Connecting to db');
    const gqlSql = await createConnection(dbConfig);
    logger.info('Connected to db');
    return { gqlSql };
};
