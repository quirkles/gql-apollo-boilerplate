import { addResolversToSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';

import resolvers from './resolvers';
import { GraphQLFileLoader, loadSchema } from 'graphql-tools';

export const getSchemaAndResolvers = async (): Promise<GraphQLSchema> => {
    const schema = await loadSchema(`${__dirname}/Schema.graphql`, {
        loaders: [new GraphQLFileLoader()],
    });
    return addResolversToSchema({ schema, resolvers });
};
