import { Logger } from 'pino';
import { Request, Response } from 'express';
import { ConnectionMap } from './database/createConnection';
import { DataSourceManager } from './dataLayer/dataSourceManager';

export interface AppUser {
    email: string;
    id: string;
}

export interface AppRequest extends Request {
    logger?: Logger;
    user?: AppUser;
}

interface ExpressIntegrationContext {
    req: AppRequest;
    res: Response;
}

export interface AppContext {
    user?: { id: string; email: string };
    logger?: Logger;
    dataSource: DataSourceManager;
}

export const createAppContext = (
    connectionMap: ConnectionMap,
): ((integrationContext: ExpressIntegrationContext) => AppContext) => {
    return (integrationContext: ExpressIntegrationContext): AppContext => {
        const dataSource = new DataSourceManager(connectionMap);
        const { req } = integrationContext;
        const { user, logger } = req;
        return { user, logger, dataSource };
    };
};
