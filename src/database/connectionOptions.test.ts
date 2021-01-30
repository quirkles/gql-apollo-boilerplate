import { join } from 'path';

export default {
    synchronize: true,
    type: 'sqlite',
    database: join(__dirname, '..', '..', 'data', process.env.DB_NAME_OVERRIDE || 'database.test.sqlite'),
};
