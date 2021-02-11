import { startApp } from './app';
import express, { Express } from 'express';

jest.mock('apollo-server-express');
jest.mock('express');

jest.mock('express', () => {
    const useMock = jest.fn();
    const listenMock = jest.fn().mockReturnValue({ isServer: true });
    return () => ({
        use: useMock,
        listen: listenMock,
        clearMocks: () => {
            useMock.mockClear();
            listenMock.mockClear();
        },
    });
});

jest.mock('./database/createConnection', () => ({
    initDbConnections: jest.fn().mockResolvedValue({
        isConnectionMap: true,
    }),
}));

jest.mock('./schema', () => ({
    getSchemaAndResolvers: jest.fn().mockResolvedValue('schema'),
}));

jest.mock('./middleware/logger', () => ({
    getLogger: jest.fn().mockReturnValue('logger'),
    getLoggerMiddleware: jest.fn().mockReturnValue('loggerMiddlware'),
}));

jest.mock('./middleware/user', () => ({
    getUserMiddleware: jest.fn().mockReturnValue('userMiddleware'),
}));

jest.mock('./appCOntext', () => ({
    createAppContext: jest.fn().mockReturnValue('appContext'),
}));

interface MockExpress extends Express {
    clearMocks: () => void;
}

describe('startApp', () => {
    let app: Express;
    beforeAll(() => {
        app = express();
    });
    beforeEach(() => {
        (app as MockExpress).clearMocks();
    });
    it('returns the server instance and the connections used by the app, default port is 4000', async (done) => {
        const { server, connectionMap } = await startApp();
        expect(app.listen).toHaveBeenCalledWith({ port: '4000' }, expect.any(Function));
        expect(server).toEqual({ isServer: true });
        expect(connectionMap).toEqual({ isConnectionMap: true });
        done();
    });
    it('returns the server instance and the connections used by the app, can override config variables', async (done) => {
        const { server, connectionMap } = await startApp({ PORT: '909090' });
        expect(app.listen).toHaveBeenCalledWith({ port: '909090' }, expect.any(Function));
        expect(server).toEqual({ isServer: true });
        expect(connectionMap).toEqual({ isConnectionMap: true });
        done();
    });
});
