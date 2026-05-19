# Contributing to AI Character Generator

Thank you for your interest in contributing to AI Character Generator! We welcome contributions from the community and are pleased to have you join us.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/AI-Character-Generator.git
   cd AI-Character-Generator
   ```
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/original-owner/AI-Character-Generator.git
   ```

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- Yarn 1.22.x or higher (or npm/pnpm)
- PostgreSQL 14+ (for local database)
- Git

### Installation

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

The application will be available at `http://localhost:3000`.

### Using Docker

Alternatively, you can use Docker for development:

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate dev
```

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots or GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests and ensure they pass:
   ```bash
   yarn test
   yarn lint
   yarn type-check
   ```

4. Commit your changes (see [Commit Message Guidelines](#commit-message-guidelines))

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request

## Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use ESLint and Prettier for formatting
- Write self-documenting code with clear variable names

### React/Next.js

- Use functional components with hooks
- Follow the Next.js App Router patterns
- Use server components where possible
- Keep components small and focused

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the existing utility-first approach
- Use CSS variables for theming

### Running Linters

```bash
# Run ESLint
yarn lint

# Run Prettier
yarn format

# Check formatting
yarn format:check

# Fix auto-fixable issues
yarn lint:fix
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```
feat(auth): add OAuth2 authentication support

fix(api): resolve issue with character generation timeout

docs(readme): update installation instructions

refactor(components): simplify character card component
```

## Pull Request Process

1. **Update the README.md** with details of changes to the interface, if applicable
2. **Ensure all tests pass** and add new tests for new functionality
3. **Update documentation** if needed
4. **Request review** from maintainers
5. **Address review comments** promptly
6. **Squash commits** if requested by maintainers

### PR Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Community

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Pull Requests**: For code contributions

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `hotfix/*`: Emergency fixes for production

### Release Process

1. Features are merged into `develop`
2. When ready for release, `develop` is merged into `main`
3. A new version tag is created
4. CI/CD automatically deploys to production

## Questions?

If you have any questions, feel free to:
- Open an issue with your question
- Start a discussion on GitHub Discussions
- Contact the maintainers

Thank you for contributing! 🚀