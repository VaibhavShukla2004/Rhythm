# Test Module Usage

This project uses Jest for unit testing.

## Run tests

- `npm test`
  - Runs all Jest tests once.
  - Uses the `test` script defined in `package.json`.

- `npm run test:watch`
  - Runs Jest in watch mode.
  - Automatically reruns tests when source or test files change.

- `npm run test:coverage`
  - Runs Jest and generates a coverage report.
  - Output appears in the `coverage/` folder.

## How the tests work

- Controller tests mock service dependencies and verify Express response behavior.
- Middleware tests invoke middleware directly and check status, JSON payloads, and next calls.
- Model tests verify the Mongoose schema shape and required fields.
- Service tests mock external dependencies like bcrypt, jwt, and API clients.

## File structure

- `tests/controllers/` - controller unit tests
- `tests/middlewares/` - middleware unit tests
- `tests/models/` - model schema tests
- `tests/services/` - service logic tests
