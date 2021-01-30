/* eslint-disable @typescript-eslint/no-var-requires */
const NodeEnvironment = require('jest-environment-node');
const { v4: uuid } = require('uuid');
const { rm } = require('fs');
const { startApp } = require('../dist/app');
const { join } = require('path');

class CustomEnvironment extends NodeEnvironment {
    testRunId;
    dbName;
    testServer;
    constructor(config) {
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
        this.testServer.close();
    }

    runScript(script) {
        return super.runScript(script);
    }

    removeDb() {
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
