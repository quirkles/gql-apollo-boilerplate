import { Greeting } from '../../../types';
import { AppContext } from '../../../appContext';

const greetingQueryResolver = {
    Greeting(_: undefined, __: undefined, context: AppContext): Greeting {
        context?.logger?.info('helloooooo');
        return { message: 'hello' };
    },
};

export default greetingQueryResolver;
