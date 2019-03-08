import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import { ApolloServer } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize, connect } from './models';
import loaders from './loaders';

const SERVER_PORT = process.env.SERVER_PORT || 8000;
const SERVER_HOST = process.env.NODE_ENV === 'production' ? process.env.HOST_NAME : 'localhost'

const app = express();

// const corsOptions = {
//   origin: `http://localhost:${port}`,
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
// app.use(cors(corsOptions));
// app.use(express.static(__dirname + '/public'));
// app.set('view engine', 'html');

const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        secret: process.env.TOKEN_SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

connect(function(err) {
  if (!err) {
    httpServer.listen({ port: SERVER_PORT }, () => {
      console.log(`Apollo Server starts on ${SERVER_HOST}:${SERVER_PORT}/graphql`)
      app.emit('serverStarted')
    })
  }
})

app.get('/api/status', (req, res) => {
  res.send({ status: 'ok' });
});

app.get('/auth', async (req, res) => {
  try {
    const me = await getMe(req)
    if(!me){
      return res.send({status: 403, message: 'Permission denied'})
    }
  } catch (error) {
    return res.send({status: 400, message: 'Bad request', error})
  }
  res.send({ status: 'ok', me})
})