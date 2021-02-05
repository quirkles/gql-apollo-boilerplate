import Mutation from './mutation';
import Query from './query';
import Message from './fieldResolver';
import { alternateResponseFor } from '../../shared/resolver';

export default {
    Mutation,
    Query,
    Message,
    MessageQueryResponse: alternateResponseFor('Message'),
    CreateMessageResponse: alternateResponseFor('Message'),
};
