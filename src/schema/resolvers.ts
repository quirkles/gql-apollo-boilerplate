import { mergeDeepRight } from 'ramda';

import message from './message/resolver';
import user from './user/resolver';

export default mergeDeepRight(message, user);
