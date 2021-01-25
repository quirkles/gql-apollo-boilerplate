import { ResponseType } from './responses';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const alternateResponseFor = (entity: string) => ({
    __resolveType(response: ResponseType) {
        return response.responseType || entity;
    },
});
