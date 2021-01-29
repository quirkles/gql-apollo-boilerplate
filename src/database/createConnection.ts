import { createConnection } from 'typeorm';
import { Logger } from 'pino';

import baseDbConfig from './connectionOptions.base';

const env = process.env.ENV || 'dev';

console.log('env is', env) //eslint-disable-line

// eslint-disable-next-line @typescript-eslint/no-var-requires
const envDbConfig = require(`./connectionOptions.${env}`).default;

const dbConfig = {
    ...baseDbConfig,
    ...envDbConfig,
};

export const initDb = async (logger: Logger): Promise<void> => {
    logger.info('Connecting to db');
    await createConnection(dbConfig);
    logger.info('Connected to db');
};
