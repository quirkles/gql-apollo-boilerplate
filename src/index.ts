import { startApp } from './app';

startApp()
    .then(() => {
        console.log('App started ok!');
    })
    .catch(console.error);
