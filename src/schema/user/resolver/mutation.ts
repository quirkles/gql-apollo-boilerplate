import { AppContext } from '../../../appContext';
import { CreateUserResponse, LoginUserResponse, MutationCreateUserArgs, MutationLoginUserArgs } from '../../../types';
import { User } from '../../../database/entities';
import { getRepository } from 'typeorm';
import { GenericErrorResponse } from '../../shared/responses';
import { sign } from 'jsonwebtoken';
import config from '../../../../config';
import { encrypt } from '../../../encrypt';

const userMutationResolver = {
    async createUser(_: undefined, args: MutationCreateUserArgs, context: AppContext): Promise<CreateUserResponse> {
        try {
            const { username } = args;
            const userRepository = getRepository(User);
            const existingUser = await userRepository.findOne({ username });
            if (existingUser) {
                return new GenericErrorResponse('Failed to create user', 'The username is taken');
            }
            const user = userRepository.create(args);
            await user.save();
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
            const userRepository = getRepository(User);
            const user = await userRepository.findOne({ username, password: encrypt(password) });
            if (user) {
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
