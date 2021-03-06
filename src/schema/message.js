import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    messages(cursor: String, limit: Int): [Message!]!
    message(id: ID!): Message!
  }
  extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(text: String!, id: ID!): Boolean!
  }
  type Message {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
  }
`;
