import { loadSchema, GraphQLFileLoader } from 'graphql-tools';

import { GraphQLSchema } from 'graphql';

const getSchema = (): Promise<GraphQLSchema> =>
    loadSchema(`${__dirname}/**/*.gql`, {
        loaders: [new GraphQLFileLoader()],
    });

export default getSchema;
