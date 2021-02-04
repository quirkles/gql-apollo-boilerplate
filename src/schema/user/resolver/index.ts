import Mutation from './mutation';
import Query from './query';
import { alternateResponseFor } from '../../shared/resolver';

export default {
    Mutation,
    Query,
    UserQueryResponse: alternateResponseFor('User'),
    CreateUserResponse: alternateResponseFor('UserAndToken'),
    LoginUserResponse: alternateResponseFor('UserAndToken'),
};
