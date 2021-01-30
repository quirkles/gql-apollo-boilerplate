import { rm } from 'fs';
import { join } from 'path';
import { startApp } from '../src/app';

const dbPath = join(__dirname, '../data', 'database.test.sqlite');

const removeDb = async (): Promise<void> =>
    new Promise((res, rej) => {
        rm(dbPath, (err) => {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });

export default async (): Promise<void> => {
    try {
        await removeDb();
    } catch (err) {
        console.log('Failed to remove test db: ', err.message);
    }
    await startApp({ ENV: 'test' });
};
