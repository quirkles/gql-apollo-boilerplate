import { join } from 'path';

export default {
    synchronize: true,
    type: 'sqlite',
    database: join(__dirname, '..', '..', 'data', 'database.test.sqlite'),
};
