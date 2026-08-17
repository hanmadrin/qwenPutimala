# Backend Test Suite

This directory contains the test suite for the Multi-Branch Ecommerce & POS System backend API.

## Test Structure

```
tests/
├── README.md              # This file
├── unit/                  # Unit tests (isolated component testing)
│   ├── authService.test.js
│   ├── productController.test.js
│   ├── orderController.test.js
│   └── couponController.test.js
└── integration/           # Integration tests (API endpoint testing)
    ├── auth.test.js
    ├── products.test.js
    └── orders.test.js
```

## Prerequisites

1. Node.js 18+ installed
2. Backend dependencies installed: `npm install`
3. Jest and Supertest are included as devDependencies

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npx jest tests/unit/authService.test.js
```

### Run Tests in Watch Mode
```bash
npx jest --watch
```

## Test Types

### Unit Tests
Unit tests focus on individual components in isolation:
- **authService.test.js**: Tests authentication service functions
- **productController.test.js**: Tests product CRUD operations
- **orderController.test.js**: Tests order management functions
- **couponController.test.js**: Tests coupon validation and creation

### Integration Tests
Integration tests verify API endpoints work correctly:
- **auth.test.js**: Tests authentication endpoints (register, login, OTP)
- **products.test.js**: Tests product API endpoints
- **orders.test.js**: Tests order API endpoints

## Mocking

Tests use Jest's mocking capabilities to isolate components:
- Prisma client is mocked to avoid database dependencies
- External services (SMS, payment gateways) are mocked
- Request/response objects are simulated

## Writing New Tests

### Unit Test Template
```javascript
const myService = require('../../src/services/myService');

// Mock Prisma
const mockPrisma = { /* ... */ };
jest.mock('../../src/config/database.js', () => ({
  __esModule: true,
  default: mockPrisma
}));

describe('My Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    mockPrisma.model.method.mockResolvedValue(expected);
    
    // Act
    const result = await myService.method(input);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Integration Test Template
```javascript
const request = require('supertest');
const app = require('../../src/server');

describe('API Endpoint Tests', () => {
  it('should return expected response', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .send(data);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
  });
});
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
test:
  script:
    - npm install
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'
```

## Troubleshooting

### Tests Fail Due to Database
Unit tests should not require a database. If they fail:
1. Check that Prisma is properly mocked
2. Ensure `jest.mock()` is called before imports

### Tests Hang
If tests don't complete:
1. Check for open database connections
2. Ensure all promises are resolved
3. Use `forceExit: true` in jest.config.js (already configured)

## Coverage Goals

Aim for:
- **Lines**: >80%
- **Functions**: >80%
- **Branches**: >70%
- **Statements**: >80%

## Best Practices

1. **Test Naming**: Use descriptive names (should_do_something_when_condition)
2. **AAA Pattern**: Arrange, Act, Assert
3. **Isolation**: Each test should be independent
4. **Cleanup**: Use `beforeEach` to reset mocks
5. **Edge Cases**: Test error conditions and edge cases
6. **Documentation**: Add comments for complex test scenarios
