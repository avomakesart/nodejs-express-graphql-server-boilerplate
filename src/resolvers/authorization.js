import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

//GraphQL Authorization on a Resolver Level
export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as user.');

export const isAdmin = combineResolvers(isAuthenticated, (parent, args, { me: { role } }) =>
  role === 'ADMIN' ? skip : new ForbiddenError('Not authorized as admin.'),
);

//Permission-based GraphQL Authorization
export const isMessageOwner = async (parent, { id }, { db, me }) => {
  const message = await db.message.findById(id, { raw: true });
  if (message.userId !== me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }
  return skip;
};
