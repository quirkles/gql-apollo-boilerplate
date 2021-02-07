import { GenericErrorResponse } from '../../shared/responses';
import { UserQueryResponse } from '../../../types';
import { AppContext } from '../../../appContext';

const messageQueryResolver = {
    async user(_: undefined, args: { userId: string }, context: AppContext): Promise<UserQueryResponse> {
        try {
            const userDataSource = context.dataSource.getDataSourceForEntity('user');
            const user = await userDataSource.findById(args.userId);
            return user || new GenericErrorResponse('Could not find user');
        } catch (e) {
            return new GenericErrorResponse('Could not find user', e.message);
        }
    },
};

export default messageQueryResolver;
