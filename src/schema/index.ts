import { addResolversToSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';

import getSchema from './schema';
import resolvers from './resolvers';

export const getSchemaAndResolvers = async (): Promise<GraphQLSchema> => {
    const schema = await getSchema();
    return addResolversToSchema({
        schema,
        resolvers,
    });
};
