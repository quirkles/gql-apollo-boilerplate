import Mutation from './mutation';
import { alternateResponseFor } from '../../shared/resolver';

export default {
    Mutation,
    CreateUserResponse: alternateResponseFor('User'),
};
