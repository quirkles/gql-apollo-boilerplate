import { Connection, createConnection } from 'typeorm';
import { Logger } from 'pino';

import baseDbConfig from './connectionOptions.base';

export const initDb = async (logger: Logger): Promise<Connection> => {
    const env = process.env.ENV || 'dev';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const envDbConfig = require(`./connectionOptions.${env}`).default;
    const dbConfig = {
        ...baseDbConfig,
        ...envDbConfig,
    };
    logger.info('Connecting to db');
    const connection = await createConnection(dbConfig);
    logger.info('Connected to db');
    return connection;
};
