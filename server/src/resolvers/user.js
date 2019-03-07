import jwt from 'jsonwebtoken';
import uuidV4 from 'uuid/v4'
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';

const tokenExpired = 60 * 60 * 8 // 8 hours

const createToken = async (user, secret) => {
  const jti = uuidV4()
  const payLoad = {
    iss: process.env.TOKEN_ISSUER || 'ISSUER',
    id,
    email,
    username,
    role,
    jti
  }
  return await jwt.sign(payLoad, secret, {
    expiresIn: tokenExpired,
  });
};

export default {
  Query: {
    users: async (parent, args, { models }) => {
      return await models.User.find();
    },
    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null;
      }

      return await models.User.findById(me.id);
    },
  },
  Mutation: {
    signUp: async (
      parent,
      { username, email, password },
      { models, secret },
    ) => {
      const user = await models.User.create({username, email, password})
      return { token: createToken(user, secret) };
    },
    signIn: async (
      parent,
      { username, password },
      { models, secret },
    ) => {
      const user = await models.User.findByLogin(username);

      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.',
        );
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: createToken(user, secret) };
    },
  }
}