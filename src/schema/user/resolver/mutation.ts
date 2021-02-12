import { AppContext } from '../../../appContext';
import { CreateUserResponse, LoginUserResponse, MutationCreateUserArgs, MutationLoginUserArgs } from '../../../types';
import { GenericErrorResponse } from '../../shared/responses';
import { sign } from 'jsonwebtoken';
import { config } from '../../../../config';
import { encrypt } from '../../../encrypt';

const userMutationResolver = {
    async createUser(_: undefined, args: MutationCreateUserArgs, context: AppContext): Promise<CreateUserResponse> {
        try {
            const { username } = args;
            const userDataSource = context.dataSource.getDataSourceForEntity('user');
            const existingUsers = await userDataSource.findByParams({ username });
            if (existingUsers && existingUsers.length) {
                return new GenericErrorResponse('Failed to create user', 'The username is taken');
            }
            const user = await userDataSource.create(args);
            const { id } = user;
            const token = sign({ username, sub: id }, config.JWT_SECRET);
            return { user, token };
        } catch (err) {
            context.logger?.error(err);
            return new GenericErrorResponse('Failed to create user', err.message);
        }
    },
    async loginUser(_: undefined, args: MutationLoginUserArgs, context: AppContext): Promise<LoginUserResponse> {
        try {
            const { username, password } = args;
            const userDataSource = context.dataSource.getDataSourceForEntity('user');
            const existingUsers = await userDataSource.findByParams({ username, password: encrypt(password) });
            if (existingUsers && existingUsers.length) {
                const user = existingUsers[0];
                const { username, id } = user;
                const token = sign({ username, sub: id }, config.JWT_SECRET);
                return { user, token };
            }
            return new GenericErrorResponse('Could not log you in', 'No matching user found');
        } catch (err) {
            context.logger?.error(err);
            return new GenericErrorResponse('Could not log you in', err.message);
        }
    },
};

export default userMutationResolver;
