import { GenericErrorResponse } from '../../shared/responses';
import { Message } from '../../../database/entities';
import { MessageQueryResponse } from '../../../types';

const messageQueryResolver = {
    async message(_: undefined, args: { messageId: string }): Promise<MessageQueryResponse> {
        try {
            const message = await Message.findOne(args.messageId);
            return message || new GenericErrorResponse('Could not find message');
        } catch (e) {
            return new GenericErrorResponse('Could not find message');
        }
    },
};

export default messageQueryResolver;
