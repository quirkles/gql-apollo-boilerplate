import { Logger } from 'pino';
import { Request, Response } from 'express';

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
}

export const createAppContext = () => (integrationContext: ExpressIntegrationContext): AppContext => {
    const { req } = integrationContext;
    const { user, logger } = req;
    return { user, logger };
};
