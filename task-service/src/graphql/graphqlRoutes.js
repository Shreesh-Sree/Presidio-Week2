import express from 'express';
import { graphql, buildSchema } from 'graphql';
import { TaskModel } from '../models/taskModel.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 1. Define GraphQL schema using the schema language
const schema = buildSchema(`
  type Task {
    id: Int!
    title: String!
    description: String
    completed: Boolean!
    createdAt: String!
  }

  type Query {
    tasks(completed: Boolean): [Task]
    task(id: Int!): Task
  }
`);

// 2. Define root resolvers mapping fields to Model queries
const rootResolver = {
  tasks: ({ completed }) => {
    // Re-use our MVC Model query (without pagination limit)
    const options = completed !== undefined ? { completed: String(completed), limit: 100 } : { limit: 100 };
    const result = TaskModel.query(options);
    return result.items;
  },
  task: ({ id }) => {
    return TaskModel.getById(id);
  }
};

// 3. Expose POST endpoint to execute GraphQL queries
router.post('/', authenticateUser, async (req, res, next) => {
  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({
      errors: [{ message: 'A GraphQL query string must be provided in the "query" field of the request body.' }]
    });
  }

  logger.info(`Executing GraphQL Query: ${query.replace(/\s+/g, ' ').trim()}`);

  try {
    const result = await graphql({
      schema,
      source: query,
      rootValue: rootResolver,
      variableValues: variables
    });

    res.status(200).json(result);
  } catch (err) {
    logger.error(`GraphQL Execution Error: ${err.message}`);
    next(err);
  }
});

export default router;
