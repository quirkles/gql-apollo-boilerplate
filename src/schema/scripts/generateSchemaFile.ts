import { join } from 'path';
import { createWriteStream } from 'fs';
import { getSchemaString } from '../schema';

const output = join(__dirname, '..', 'Schema.graphql');
const writeFile = (schemaString: string): Promise<string> =>
    new Promise((res, rej) => {
        const writer = createWriteStream(output, { flags: 'w' });
        writer.on('finish', () => res(output));
        writer.on('error', rej);
        writer.write(schemaString);
        writer.end();
    });

getSchemaString()
    .then(writeFile)
    .then((destination) => {
        console.log(destination) //eslint-disable-line
    })
    .catch((err) => {
        console.log(err) //eslint-disable-line
    });
