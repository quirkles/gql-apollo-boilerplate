import { ResponseType } from './responses';

export const alternateResponseFor = (entity: string) => ({
    __resolveType(response: ResponseType) {
        return response.responseType || entity;
    },
});
