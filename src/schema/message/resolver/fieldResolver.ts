import { Message, MessageResolvers, User } from '../../../types';
import { AppContext } from '../../../appContext';

const FieldResolver: MessageResolvers<AppContext> = {
    async text(parent: Message, args: unknown, context: AppContext) {
        if (parent.text) {
            return parent.text;
        } else if (parent.id) {
            const messageDataSource = context.dataSource.getDataSourceForEntity('message');
            const message = await messageDataSource.findById(parent.id);
            if (message) {
                return message.text;
            }
        }
        context.logger?.error('Failed to find the message text');
        return '';
    },
    async sender(parent: Message, args: unknown, context: AppContext): Promise<User> {
        if (parent.sender) {
            return parent.sender;
        } else if (parent.id) {
            const messageDataSource = context.dataSource.getDataSourceForEntity('message');
            const userDataSource = context.dataSource.getDataSourceForEntity('user');
            const message = await messageDataSource.findById(parent.id);
            if (message) {
                const sender = await userDataSource.findById(String(message.senderId));
                if (sender) {
                    return sender;
                }
            }
        }
        context.logger?.error('Failed to find the message sender');
        return {} as User;
    },
    async recipient(parent: Message, args: unknown, context: AppContext): Promise<User> {
        if (parent.recipient) {
            return parent.recipient;
        } else if (parent.id) {
            const messageDataSource = context.dataSource.getDataSourceForEntity('message');
            const userDataSource = context.dataSource.getDataSourceForEntity('user');
            const message = await messageDataSource.findById(parent.id);
            if (message) {
                const recipient = await userDataSource.findById(String(message.recipientId));
                if (recipient) {
                    return recipient;
                }
            }
        }
        context.logger?.error('Failed to find the message recipient');
        return {} as User;
    },
};

export default FieldResolver;
