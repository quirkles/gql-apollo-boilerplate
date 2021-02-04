import { GenericErrorResponse } from '../../shared/responses';
import { User } from '../../../database/entities';
import { UserQueryResponse } from '../../../types';

const messageQueryResolver = {
    async user(_: undefined, args: { userId: string }): Promise<UserQueryResponse> {
        try {
            const message = await User.findOne(args.userId);
            return message || new GenericErrorResponse('Could not find message');
        } catch (e) {
            return new GenericErrorResponse('Could not find message');
        }
    },
};

export default messageQueryResolver;
