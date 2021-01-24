import { ApolloServer, gql } from 'apollo-server-express';
import express, { Express } from 'express';

import { resolvers, typeDefs } from './schema';
import {getLogger, getLoggerMiddleware} from "./middleware/logger";
import {createAppContext} from "./appContext";
import {getUserMiddleware} from "./middleware/user";

const app: Express = express()

const appLogger = getLogger()

app.use(getUserMiddleware())
app.use(getLoggerMiddleware(appLogger))

const server = new ApolloServer({
    typeDefs: gql`
        ${typeDefs}
    `,
  resolvers,
  introspection: true,
  context: createAppContext(),
});


server.applyMiddleware({ app });

app.use((req, res) => {
    res.status(200);
    res.send('Hello!');
    res.end();
});

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
