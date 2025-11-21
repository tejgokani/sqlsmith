# Contributing to SQLSmith

Thank you for your interest in contributing to SQLSmith! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `ˇhttps://github.com/tejgokani/sqlsmith.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development

### Project Structure

```
sqlsmith/
├── bin/              # CLI entry point
├── src/              # Source code
│   ├── parser/       # Schema parsing
│   ├── generator/    # SQL generation
│   ├── integrator/   # Supabase integration
│   └── utils/        # Utilities
├── tests/            # Test files
├── templates/        # SQL templates
└── examples/         # Example schemas
```

### Running Tests

```bash
npm test
```

### Testing CLI Commands

```bash
node bin/sqlsmith.js <command>
```

### Code Style

- Use ES6+ features
- Follow existing code formatting
- Add JSDoc comments for functions
- Keep functions small and focused

## Submitting Changes

1. Ensure all tests pass: `npm test`
2. Commit your changes with clear messages
3. Push to your fork
4. Open a Pull Request

### Commit Messages

Follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Example: `feat: add support for composite primary keys`

## Pull Request Guidelines

- Update documentation for new features
- Add tests for new functionality
- Keep PRs focused on a single change
- Reference any related issues

## Reporting Bugs

Open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- SQLSmith version
- Node.js version

## Feature Requests

Open an issue describing:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## Questions?

Feel free to open an issue for questions or discussions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
