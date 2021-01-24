import { ApolloServer, gql } from 'apollo-server-express';
import express, { Express } from 'express';

import { resolvers, typeDefs } from './schema';
import { getLogger } from "./logger";

const logger = getLogger()

const server = new ApolloServer({
typeDefs: gql`
    ${typeDefs}
`,
  resolvers,
  introspection: true,
  context: ({ req, res }: any) => ({
      req,
      res,
  }),
  formatError: (error: any) => {
      logger.error(
          error.message,
          logger.context({
              ...error,
          })
      );
      return error;
  },
});

const app: Express = express()

server.applyMiddleware({ app });

app.use((req, res) => {
    res.status(200);
    res.send('Hello!');
    res.end();
});

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
