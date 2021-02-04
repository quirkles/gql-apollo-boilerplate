import { AppContext } from '../../../appContext';
import { GenericErrorResponse, UnauthorizedRequestResponse } from '../../shared/responses';
import { Message, User } from '../../../database/entities';
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
            const [recipient, sender] = await Promise.all([
                User.findOneOrFail(args.input.recipientId),
                User.findOneOrFail(context.user.id),
            ]);
            if (recipient && sender) {
                const message = new Message();
                message.recipient = recipient;
                message.sender = sender;
                message.text = args.input.messageText;
                return message.save();
            }
            return new GenericErrorResponse('Could not create message', 'Could not locate the specified recipient');
        } catch (e) {
            return new GenericErrorResponse('Could not create message', e.message);
        }
    },
};

export default messageMutationResolver;
