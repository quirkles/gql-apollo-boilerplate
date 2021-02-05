import { assoc, filter, mergeDeepRight, values, whereEq } from 'ramda';

export class DataStore<Entity extends { id: string }> {
    private store: Record<string, Entity> = {};

    public retrieveMatchingRecords(params: Partial<Entity>): Entity[] {
        return filter(whereEq(params), values(this.store));
    }

    public retrieveRecordById(id: string): Entity | null {
        return this.store[id] || null;
    }

    public insertRecord(entity: Entity): Entity {
        const mergedEntity = mergeDeepRight(this.store[entity.id] || {}, entity);
        assoc(entity.id, mergedEntity, this.store);
        return mergedEntity as Entity;
    }

    public insertRecords(entities: Entity[]): void {
        for (const entity of entities) {
            assoc(entity.id, mergeDeepRight(this.store[entity.id], entity), this.store);
        }
    }
}
