

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    // messages: async (parent, { cursor, limit = 100 }, { models }) => {
    //   const cursorOptions = cursor
    //     ? {
    //         where: {
    //           createdAt: {
    //             [Sequelize.Op.lt]: fromCursorHash(cursor),
    //           },
    //         },
    //       }
    //     : {};

    //   const messages = await models.Message.find({
    //     order: [['createdAt', 'DESC']],
    //     limit: limit + 1,
    //     ...cursorOptions,
    //   });

    //   const hasNextPage = messages.length > limit;
    //   const edges = hasNextPage ? messages.slice(0, -1) : messages;

    //   return {
    //     edges,
    //     pageInfo: {
    //       hasNextPage,
    //       endCursor: toCursorHash(
    //         edges[edges.length - 1].createdAt.toString(),
    //       ),
    //     },
    //   };
    // },
  }
}