import { AppContext } from '../../../appContext';
import { CreateUserResponse, MutationCreateUserArgs } from '../../../types';
import { GenericErrorResponse } from '../../shared/responses';

const userMutationResolver = {
    createUser(_: undefined, args: MutationCreateUserArgs, context: AppContext): Promise<CreateUserResponse> {
        context.logger?.info(args, 'attempting to create user');
        return Promise.resolve(new GenericErrorResponse('Failed to create user', 'you suck'));
    },
};

export default userMutationResolver;
