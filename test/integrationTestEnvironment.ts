import type { Config } from '@jest/types';
import NodeEnvironment from 'jest-environment-node';
import { v4 as uuid } from 'uuid';
import { rm } from 'fs';
import { startApp } from '../src/app';
import { Server } from 'http';
import { Script } from 'vm';
import { join } from 'path';

class CustomEnvironment extends NodeEnvironment {
    private readonly testRunId: string;
    private readonly dbName: string;
    testServer: Server | null = null;
    constructor(config: Config.ProjectConfig) {
        super(config);
        const testRunId = uuid();
        this.testRunId = testRunId;
        this.dbName = `database.test.${testRunId}.sqlite`;
    }

    async setup() {
        await super.setup();
        this.testServer = await startApp({ ENV: 'test', DB_NAME_OVERRIDE: this.dbName });
    }

    async teardown() {
        await super.teardown();
        try {
            await this.removeDb();
        } catch (err) {
            console.log('Failed to remove test db: ', err.message);
        }
    }

    runScript<T = unknown>(script: Script): T | null {
        return super.runScript(script);
    }

    removeDb(): Promise<void> {
        const dbPath = join(__dirname, '../data', this.dbName);

        return new Promise((res, rej) => {
            rm(dbPath, (err) => {
                if (err) {
                    rej(err);
                } else {
                    res();
                }
            });
        });
    }
}

module.exports = CustomEnvironment;
