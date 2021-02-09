import { AppContext } from '../../../appContext';
import { GenericErrorResponse, UnauthorizedRequestResponse } from '../../shared/responses';
import { CreateMessageInput, CreateMessageResponse } from '../../../types';

const messageMutationResolver = {
    async createMessage(
        _: undefined,
        args: { input: CreateMessageInput },
        context: AppContext,
    ): Promise<CreateMessageResponse> {
        if (!context.user) {
            return new UnauthorizedRequestResponse();
        }
        try {
            const userDataSource = context.dataSource.getDataSourceForEntity('user');
            const messageDataSource = context.dataSource.getDataSourceForEntity('message');
            const [recipient, sender] = await Promise.all([
                userDataSource.findById(args.input.recipientId),
                userDataSource.findById(context.user.id),
            ]);
            if (recipient && sender) {
                const message = {
                    text: args.input.messageText,
                    recipient,
                    sender,
                };
                return messageDataSource.create(message);
            }
            return new GenericErrorResponse('Could not create message', 'Could not locate the specified recipient');
        } catch (e) {
            return new GenericErrorResponse('Could not create message', e.message);
        }
    },
};

export default messageMutationResolver;
