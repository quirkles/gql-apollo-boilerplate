import pino, { Logger } from 'pino';
import * as os from 'os';
import { join } from 'path';

import config from '../../config';
import {NextFunction, Response} from "express";
import {v4 as uuid} from "uuid";
import {AppRequest} from "../appContext";

let logOutput: string | number = 1;
if (config.LOG_TO_FILE) {
    logOutput = join(__dirname, '..', '..', 'logs', `server.log`);
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

export const getLoggerMiddleware = (logger: Logger) => (req: AppRequest, res: Response, next: NextFunction) => {
    const requestId = uuid()
    const { user } = req;
    const requestLogger = logger.child({
        requestId,
        requestUser: user,
    });
    requestLogger.info(req, 'Request received')
    req.logger = requestLogger
    return next()
}
