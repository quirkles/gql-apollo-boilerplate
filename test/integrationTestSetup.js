/* eslint-disable @typescript-eslint/no-var-requires  */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types  */
const { exec } = require('child_process');
const { join } = require('path');

const projectRoot = join(__dirname, '../');

console.log(projectRoot) //eslint-disable-line

const compileTs = () =>
    new Promise((res, rej) => {
        exec(
            'npm run build',
            {
                cwd: projectRoot,
                env: {
                    ...process.env,
                    ENV: 'test',
                },
            },
            (err, stdOut) => {
                if (err) {
                    rej(err);
                }
                res(stdOut);
            },
        );
    });

const setup = async () => {
    try {
        const compileOutput = await compileTs();
        console.log(compileOutput) //eslint-disable-line
    } catch (err) {
      console.log('error') //eslint-disable-line
      console.log(err) //eslint-disable-line
    }
};

setup()
    .then(() => {
        console.log('done');
    })
    .catch((err) => console.log(err));
