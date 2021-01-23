import pino, { Logger } from 'pino';
import * as os from 'os';
import { join } from 'path';

import config from '../config';

let logOutput: string | number = 1;
if (config.LOG_TO_FILE) {
    logOutput = join(__dirname, '..', 'logs', `server.log`);
}

let logger: Logger;

export const getLogger = (): Logger => {
    if (logger) {
        return logger;
    }
    logger = pino(
        {
            base: {
                env: process.env.ENV,
                pid: process.pid,
                hostname: os.hostname,
            },
            nestedKey: 'payload'
        },
        pino.destination(logOutput),
    );
    logger.info(`Starting logging to ${logOutput === 1 ? 'stdout' : logOutput}`);
    return logger;
};
