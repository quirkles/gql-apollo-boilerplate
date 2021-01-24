import { join } from 'path';

export default {
    name: 'default',
    entities: [`${join(__dirname)}/entities/**/*.ts`],
};
