const authService = require('../../src/services/authService');

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  customer: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
};

jest.mock('../../src/config/database.js', () => ({
  __esModule: true,
  default: mockPrisma
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'CASHIER',
        branchId: 'branch-1'
      };

      const createdUser = {
        id: 'user-1',
        ...userData,
        password: undefined // Password should not be returned
      };

      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await authService.registerUser(userData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          branchId: userData.branchId
        })
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'CASHIER',
        branchId: 'branch-1'
      };

      mockPrisma.user.create.mockRejectedValue(new Error('User already exists'));

      await expect(authService.registerUser(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('loginUser', () => {
    it('should return token for valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = {
        id: 'user-1',
        name: 'Test User',
        email: loginData.email,
        role: 'CASHIER',
        branchId: 'branch-1'
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await authService.loginUser(loginData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email }
      });
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual(expect.objectContaining({
        id: user.id,
        name: user.name,
        email: user.email
      }));
    });

    it('should throw error for invalid credentials', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.loginUser(loginData)).rejects.toThrow('Invalid credentials');
    });
  });
});
