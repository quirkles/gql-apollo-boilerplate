import axios from 'axios';
import { Connection, Repository } from 'typeorm';
import { User } from '../../../database/entities';

describe('user mutations integration', () => {
    const connection: Connection = global.dbConnection as Connection;
    beforeAll(() => {
        axios.defaults.baseURL = `http://localhost:4000`;
    });
    describe('createUser', () => {
        it('creates a user and returns the user and token', async () => {
            const userRepository = connection.getRepository('User');
            const beforeUser = await userRepository.findOne({ username: 'quirkles' });
            expect(beforeUser).toBeUndefined();
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
            const { user, token } = data.data.createUser;
            expect(user.username).toEqual('quirkles');
            expect(user.id).toBeTruthy();
            expect(token).toMatch(/[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9_-]+/);
            await userRepository.delete({ username: 'quirkles' });
        });
        it('creates a user and returns expected error if that user exists', async () => {
            const userRepository: Repository<User> = connection.getRepository('User');
            const notFoundUser = await userRepository.findOne({ username: 'quirkles' });
            expect(notFoundUser).toBeUndefined();
            const user: User = userRepository.create({ username: 'quirkles', password: 'abcd' });
            await user.save();
            const foundUser = await userRepository.findOne({ username: 'quirkles' });
            expect(foundUser).not.toBeUndefined();
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
            expect(data.data.createUser).toEqual({
                message: 'Failed to create user',
                reason: 'The username is taken',
            });
            await userRepository.delete({ username: 'quirkles' });
        });
    });
});
