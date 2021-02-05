import Mutation from './mutation';
import Query from './query';
import { FieldResolver } from './fieldResolver';
import { alternateResponseFor } from '../../shared/resolver';

export default {
    Mutation,
    Query,
    Message: FieldResolver,
    MessageQueryResponse: alternateResponseFor('Message'),
    CreateMessageResponse: alternateResponseFor('Message'),
};
