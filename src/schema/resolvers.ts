import greeting from './greeting/resolver';
import user from './user/resolver';

export default {
    ...greeting,
    ...user,
};
