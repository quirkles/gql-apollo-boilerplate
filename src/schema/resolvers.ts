import { mergeDeepRight } from 'ramda';

import greeting from './greeting/resolver';
import user from './user/resolver';

export default mergeDeepRight(greeting, user);
