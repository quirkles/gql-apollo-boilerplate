import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';
import express, { Express } from 'express';

import { getSchemaAndResolvers } from './schema';
import { getLogger, getLoggerMiddleware } from './middleware/logger';
import { createAppContext } from './appContext';
import { getUserMiddleware } from './middleware/user';
import { initDb } from './database/createConnection';
import config from '../config';

const app: Express = express();
const appLogger = getLogger();

const port = config.PORT || '4000';

initDb(appLogger)
    .then(async () => {
        const schema = await getSchemaAndResolvers();
        app.use(getUserMiddleware());
        app.use(getLoggerMiddleware(appLogger));

        const server = new ApolloServer({
            schema,
            introspection: true,
            context: createAppContext(),
        });

        server.applyMiddleware({ app });

        app.use((req, res) => {
            res.status(200);
            res.send('Hello!');
            res.end();
        });

        app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
    })
    .catch((err) => {
        appLogger.error(err.message);
    });
