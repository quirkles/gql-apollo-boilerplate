import { createConnection } from 'typeorm';
import { Logger } from 'pino';

import baseDbConfig from './connectionOptions.base';

const env = process.env.ENV || 'dev';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const envDbConfig = require(`./connectionOptions.${env}`).default;

const dbConfig = {
    ...baseDbConfig,
    ...envDbConfig,
};

export const initDb = async (logger: Logger): Promise<void> => {
    logger.info(dbConfig, 'Connecting to db');
    const connection = await createConnection(dbConfig);
    logger.info(connection, 'Connected to db');
};
