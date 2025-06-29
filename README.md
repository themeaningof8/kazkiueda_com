# kazkiueda_com

This is the repository for my personal website.

## Development

To install dependencies:

```bash
bun install
```

To run the development server:

```bash
bun run dev
```

## Testing

This project uses [Vitest](https://vitest.dev/) for unit/integration testing and
[Playwright](https://playwright.dev/) for end-to-end testing.

To run all tests:

```bash
bun run test
```

### Test Coverage

We aim to maintain a high level of test coverage to ensure code quality and
stability. The project is configured to enforce a minimum of 80% test coverage
for statements, branches, and lines.

To run tests with coverage reporting:

```bash
bun run test:coverage
```

This will generate a coverage report in the `coverage/` directory. The command
will fail if the coverage drops below the configured thresholds.

---

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh)
is a fast all-in-one JavaScript runtime.
