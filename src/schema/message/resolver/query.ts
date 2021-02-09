import { GenericErrorResponse } from '../../shared/responses';
import { MessageQueryResponse } from '../../../types';
import { AppContext } from '../../../appContext';

const messageQueryResolver = {
    async message(_: undefined, args: { messageId: string }, context: AppContext): Promise<MessageQueryResponse> {
        try {
            const messageDataSource = context.dataSource.getDataSourceForEntity('message');
            const message = await messageDataSource.findById(args.messageId);
            return message || new GenericErrorResponse('Could not find message');
        } catch (e) {
            return new GenericErrorResponse('Could not find message', e.message);
        }
    },
};

export default messageQueryResolver;
