import 'dotenv/config';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

import schema from './schema';
import resolvers from './resolvers';
import db, { sequelize } from './models';

const app = express();

app.use(cors());

const getMe = async (req) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: (error) => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return { db };
    }
    if (req) {
      const me = await getMe(req);
      return {
        db,
        me,
        secret: process.env.SECRET,
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages(new Date());
  }

  app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
  });
});

const createUsersWithMessages = async (date) => {
  await db.user.create(
    {
      username: 'alvarocastle',
      email: 'avomakesart@protonmail.com',
      password: 'BLUEcat2518',
      role: 'ADMIN',
      messages: [
        {
          text: 'Published the Road to learn React',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [db.message],
    },
  );

  await db.user.create(
    {
      username: 'jessieb',
      email: 'jessicabegardea@gmail.com',
      password: 'Limalimon1',
      role: 'USER',
      messages: [
        {
          text: 'Happy to release ...',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          text: 'Published a complete ...',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [db.message],
    },
  );
};
