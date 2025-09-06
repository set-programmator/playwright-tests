# Contributing Guidelines

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development Workflow

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier (configured)
- Write meaningful commit messages
- Add JSDoc comments for public methods

### Testing
- Write tests for new features
- Ensure all tests pass: `npm test`
- Add appropriate test tags (@smoke, @regression)
- Update test data if needed

### Pull Request Process
1. Update documentation if needed
2. Add tests for new functionality  
3. Ensure CI passes
4. Request review from maintainers
5. Address feedback promptly

## Code Standards

### File Naming
- Use kebab-case for files: `user-profile.spec.ts`
- Use PascalCase for classes: `UserProfilePage`
- Use camelCase for methods: `getUserProfile()`

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Use appropriate test tags

### Page Objects
- Inherit from BasePage
- Use data-testid selectors
- Implement meaningful method names
- Add proper error handling

## Reporting Issues

### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Add screenshots/videos if applicable
- Specify browser and environment

### Feature Requests  
- Use the feature request template
- Explain the use case
- Provide implementation suggestions
- Consider backward compatibility