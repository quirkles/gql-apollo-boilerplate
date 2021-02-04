const tasks = (arr) => arr.join(' && ');

module.exports = {
    hooks: {
        'pre-commit': tasks(['nvm use', 'npm run lint', 'npm run test:unit']),
        'pre-push': tasks(['nvm use', 'npm run lint', 'npm run test']),
    },
};
