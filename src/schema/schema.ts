import { loadSchema, GraphQLFileLoader } from 'graphql-tools';

import { GraphQLSchema, printSchema } from 'graphql';

export const compileSchema = (): Promise<GraphQLSchema> =>
    loadSchema(`${__dirname}/**/*.gql`, {
        loaders: [new GraphQLFileLoader()],
    });

export const getSchemaString = (): Promise<string> => compileSchema().then(printSchema);
