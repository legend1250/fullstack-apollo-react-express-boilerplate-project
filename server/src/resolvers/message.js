import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated, isMessageOwner } from './authorization';

import pubsub, { EVENTS } from '../subscription';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
            createdAt: {
              '$lt': fromCursorHash(cursor),
            },
          }
        : {};

      const messages = await models.Message.find({
        ...cursorOptions,
      }, null, {
        limit: limit + 1,
        sort: {
          createdAt: -1
        }
      })

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges[edges.length - 1] ? toCursorHash(
            edges[edges.length - 1].createdAt.toString()
          ) : '',
        },
      };
    },

    message: async (parent, { id }, { models }) =>
      await models.Message.findById(id),
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { models, me }) => {
        const message = await models.Message.create({
          text,
          userId: me.id,
        });

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message },
        });

        return message;
      },
    ),

    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) =>{
        try {
          const { errors } = await models.Message.findByIdAndDelete(id)
          if(errors){
            return false
          }
        } catch (error) {
          return false
        }
        return true
      },
    ),
  },

  Message: {
    user: async (message, args, { loaders }) =>
      await loaders.user.load(message.userId)
  },

  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
    },
  },
}