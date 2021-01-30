import axios from 'axios';

describe('user mutations integration', () => {
    beforeAll(() => {
        axios.defaults.baseURL = `http://localhost:4000`;
    });
    describe('createUser', () => {
        it('creates a user and returns the user and token', async () => {
            const query = `mutation {
  createUser(password: "abcd", username: "quirkles") {
    ... on UserAndToken {
      user {
        username
        id
      }
      token
    }
    ... on GenericError {
      message
      reason
    }
  }
}`;

            const { data } = await axios.post('/graphql', { query });
            console.log(data.data) //eslint-disable-line
        });
    });
});
