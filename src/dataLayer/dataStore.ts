import { assoc, mergeDeepRight } from 'ramda';

export class DataStore<Entity extends { id: string }> {
    private store: Record<string, Entity> = {};

    public retrieveRecordById(id: string): Entity | null {
        return this.store[id] || null;
    }

    public insertRecord(entity: Entity): void {
        assoc(entity.id, mergeDeepRight(this.store[entity.id], entity), this.store);
    }
}
