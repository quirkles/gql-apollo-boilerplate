import { join } from 'path';
import { createWriteStream, createReadStream } from 'fs';

const pathToSchema = join(__dirname, '..', 'Schema.graphql');

const destination = join(__dirname, '../../..', 'dist/schema', 'Schema.graphql');

const copySchema = () =>
    new Promise((res, rej) => {
        const writer = createWriteStream(destination, { flags: 'w' });
        writer.on('finish', () => {
            console.log('Writer finish') //eslint-disable-line
            res(destination);
        });
        writer.on('error', rej);

        const reader = createReadStream(pathToSchema);
        reader.on('open', function () {
            console.log('Begin copying schema') //eslint-disable-line
            reader.pipe(writer);
        });

        reader.on('end', () => {
            console.log('Reader end') //eslint-disable-line
            writer.close();
        });
        reader.on('error', rej);
    });

copySchema().then((result) => {
    console.log(`Successfully copied schema to ${result}`) //eslint-disable-line
});
