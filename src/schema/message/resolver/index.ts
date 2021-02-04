import Mutation from './mutation';
import Query from './query';
import { alternateResponseFor } from '../../shared/resolver';

export default {
    Mutation,
    Query,
    MessageQueryResponse: alternateResponseFor('Message'),
    CreateMessageResponse: alternateResponseFor('Message'),
};
