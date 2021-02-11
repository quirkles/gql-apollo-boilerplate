import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';
import express, { Express } from 'express';
import { Server } from 'http';

import { getSchemaAndResolvers } from './schema';
import { getLogger, getLoggerMiddleware } from './middleware/logger';
import { createAppContext } from './appContext';
import { getUserMiddleware } from './middleware/user';
import { ConnectionMap, initDbConnections } from './database/createConnection';
import { AppConfig, getConfig } from '../config';

const app: Express = express();
const appLogger = getLogger();

export const startApp = (
    envOverrides: Partial<AppConfig> = {},
): Promise<{
    server: Server;
    connectionMap: ConnectionMap;
}> => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = getConfig(envOverrides);
    return initDbConnections(appLogger)
        .then(async (connectionMap: ConnectionMap) => {
            const port = config.PORT || '4000';
            const schema = await getSchemaAndResolvers();
            app.use(getUserMiddleware());
            app.use(getLoggerMiddleware(appLogger));

            const server = new ApolloServer({
                schema,
                introspection: true,
                context: createAppContext(connectionMap),
            });

            server.applyMiddleware({ app });

            const httpServer = app.listen({ port }, () =>
                console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`),
            );
            return {
                server: httpServer,
                connectionMap,
            };
        })
        .catch((err) => {
            appLogger.error(err.message);
            throw err;
        });
};
