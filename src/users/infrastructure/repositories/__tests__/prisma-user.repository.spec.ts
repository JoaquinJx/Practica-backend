import { PrismaUserRepository } from '../prisma-user.repository';
import { PrismaService } from '../../../../shared/services/prisma.service';
import { CreateUser, User1, User } from '../../../domain/entities/user.entity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('PrismaUserRepository', () => {
    let prismaUserRepository: PrismaUserRepository;
    
    let prismaService: PrismaService;

    beforeEach(async () => {
        const mockPrismaService = {
            user: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(), 
            }
        };

        prismaService = mockPrismaService as any;
        prismaUserRepository = new PrismaUserRepository(prismaService);
    });

    describe('create', () => {
        it('should create a user successfully', async () => {
            const createUserData: CreateUser = {
                email: 'test@example.com',
                password: 'hashedpassword123',
                name: 'test user',
                avatarUrl: 'https://example.com/avatar.jpg',    
                role: 'USER'
            };

            const mockCreatedUser: User1 = {
                id: '1',
                email: 'test@example.com',
                password: 'hashedpassword123',
                name: 'test user',
                avatarUrl: 'https://example.com/avatar.jpg',    
                role: 'USER',
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01')
            };

            (prismaService.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
            
            const result = await prismaUserRepository.create(createUserData);

            expect(result).toEqual(mockCreatedUser);
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: createUserData
            });
        });

        it('should throw an error if user already exists', async () => {
            const createUserData: CreateUser = {
                email: 'test@example.com',
                password: 'hashedpassword123',
                name: 'test user',
                role: 'USER'
            };

            const mockPrismaError = new PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002',
                clientVersion: '5.0.0'
            });

            (prismaService.user.create as jest.Mock).mockRejectedValue(mockPrismaError);

            await expect(prismaUserRepository.create(createUserData))
                .rejects
                .toThrow('Conflict: User with email "test@example.com" already exists.');
        });

        it('should throw a generic error if Prisma throws an unexpected error', async () => {
            const createUserData: CreateUser = {
                email: 'test@example.com',
                password: 'hashedpassword123',
                name: 'test user',
                role: 'USER'
            };

            const mockGenericError = new Error('Database connection failed');

            (prismaService.user.create as jest.Mock).mockRejectedValue(mockGenericError);

            await expect(prismaUserRepository.create(createUserData))
                .rejects
                .toThrow('Failed to create user: Database connection failed');
        });
    });

    describe('update', () => {
        it('should update a user successfully', async () => {
            const updateUserData: Partial<User1> = {
                email: 'updatedEmail@example.com',
                name: 'Updated User'
            };
            const mockUpdatedUser: User1 = {
                id: '1',
                email: 'updated@example.com',
                password: 'hashedpassword123',
                name: 'Updated Name',
                avatarUrl: 'https://example.com/avatar.jpg',
                role: 'USER',
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-02')
            };

            (prismaService.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

            const result = await prismaUserRepository.update('1', updateUserData);

            expect(result).toBeInstanceOf(User);
            expect(result?.email).toBe('updated@example.com');
            expect(result?.name).toBe('Updated Name');
            expect(prismaService.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    email: updateUserData.email,
                    name: updateUserData.name
                }
            });
        });

        it('should return null when user is not found', async () => {
            const userId = '9999999';
            const updateUserData: Partial<User1> = {
                name: 'updated name'
            };

            const mockPrismaError = new PrismaClientKnownRequestError('Record to update not found', {
                code: 'P2025',
                clientVersion: '5.0.0'
            });

            (prismaService.user.update as jest.Mock).mockRejectedValue(mockPrismaError);
             
            const result = await prismaUserRepository.update(userId, updateUserData);
            
            expect(result).toBeNull();
        });

        it('should throw error when email already exists', async () => {
            const userId = '1';
            const updateUserData: Partial<User1> = {
                email: 'duplicate@example.com'
            };
            const mockPrismaError = new PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002',
                clientVersion: '5.0.0'
            });

            (prismaService.user.update as jest.Mock).mockRejectedValue(mockPrismaError);

            await expect(prismaUserRepository.update(userId, updateUserData))
                .rejects
                .toThrow('Conflict: email "duplicate@example.com" already in use.');
        });

        it('should throw generic error for unexpected errors', async () => {
            const userId = '1';
            const updateData: Partial<User1> = {
                name: 'Updated Name'
            };

            const mockGenericError = new Error('Database connection failed');

            (prismaService.user.update as jest.Mock).mockRejectedValue(mockGenericError);

            await expect(prismaUserRepository.update(userId, updateData))
                .rejects
                .toThrow('Failed to update user with ID 1: Database connection failed');
        });
    });

    describe('delete', () => {
        it('should delete a user successfully', async () => {
            const userId = '1';

            (prismaService.user.delete as jest.Mock).mockResolvedValue(undefined);

            const result = await prismaUserRepository.delete(userId);

            expect(result).toBe(true);
            expect(prismaService.user.delete).toHaveBeenCalledWith({
                where: { id: userId }
            });
        });

        it('should return false when user is not found', async () => {
            const userId = '999';

            const mockPrismaError = new PrismaClientKnownRequestError('Record to delete does not exist', {
                code: 'P2025',
                clientVersion: '5.0.0'
            });

            (prismaService.user.delete as jest.Mock).mockRejectedValue(mockPrismaError);

            const result = await prismaUserRepository.delete(userId);

            expect(result).toBe(false);
        });

        it('should throw generic error for unexpected errors', async () => {
            const userId = '1';

            const mockGenericError = new Error('Database connection failed');

            (prismaService.user.delete as jest.Mock).mockRejectedValue(mockGenericError);

            await expect(prismaUserRepository.delete(userId))
                .rejects
                .toThrow('Failed to delete user with ID 1: Database connection failed');
        });
    });

    describe('findByEmail', () => {
        it('should find a user by email successfully', async () => {
            const email = 'test@example.com';
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'hashedpassword123',
                name: 'Test User',
                avatarUrl: 'https://example.com/avatar.jpg',
                role: 'USER',
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01')
            };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await prismaUserRepository.findByEmail(email);

            expect(result).toBeInstanceOf(User);
            expect(result?.email).toBe(email);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
        });

        it('should return null when user is not found', async () => {
            const email = 'nonexistent@example.com';

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await prismaUserRepository.findByEmail(email);

            expect(result).toBeNull();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email }
            });
        });

        it('should throw generic error for unexpected errors', async () => {
            const email = 'test@example.com';

            const mockGenericError = new Error('Database connection failed');

            (prismaService.user.findUnique as jest.Mock).mockRejectedValue(mockGenericError);

            await expect(prismaUserRepository.findByEmail(email))
                .rejects
                .toThrow('Failed to retrieve user by email test@example.com: Database connection failed');
        });
    });

    describe('findById', () => {
        it('should find a user by ID successfully', async () => {
            const userId = '1';
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'hashedpassword123',
                name: 'Test User',
                avatarUrl: 'https://example.com/avatar.jpg',
                role: 'USER',
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01')
            };

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await prismaUserRepository.findById(userId);

            expect(result).toBeInstanceOf(User);
            expect(result?.id).toBe(userId);
            expect(result?.email).toBe('test@example.com');
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId }
            });
        });

        it('should return null when user is not found', async () => {
            const userId = '999';

            (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await prismaUserRepository.findById(userId);

            expect(result).toBeNull();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId }
            });
        });

        it('should throw generic error for unexpected errors', async () => {
            const userId = '1';

            const mockGenericError = new Error('Database connection failed');

            (prismaService.user.findUnique as jest.Mock).mockRejectedValue(mockGenericError);

            await expect(prismaUserRepository.findById(userId))
                .rejects
                .toThrow('Failed to retrieve user by ID 1: Database connection failed');
        });
    });

    describe('findAll', () => {
        it('should find all users successfully', async () => {
            const mockUsers = [
                {
                    id: '1',
                    email: 'user1@example.com',
                    password: 'hashedpassword123',
                    name: 'User One',
                    avatarUrl: 'https://example.com/avatar1.jpg',
                    role: 'USER',
                    createdAt: new Date('2025-01-01'),
                    updatedAt: new Date('2025-01-01')
                },
                {
                    id: '2',
                    email: 'user2@example.com',
                    password: 'hashedpassword456',
                    name: 'User Two',
                    avatarUrl: 'https://example.com/avatar2.jpg',
                    role: 'ADMIN',
                    createdAt: new Date('2025-01-02'),
                    updatedAt: new Date('2025-01-02')
                }
            ];

            (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

            const result = await prismaUserRepository.findAll();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(User);
            expect(result[1]).toBeInstanceOf(User);
            expect(result[0].id).toBe('1');
            expect(result[0].email).toBe('user1@example.com');
            expect(result[1].id).toBe('2');
            expect(result[1].email).toBe('user2@example.com');
            expect(prismaService.user.findMany).toHaveBeenCalledWith();
        });

        it('should return empty array when no users exist', async () => {
            (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

            const result = await prismaUserRepository.findAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
            expect(prismaService.user.findMany).toHaveBeenCalledWith();
        });

        it('should throw generic error for unexpected errors', async () => {
            const mockGenericError = new Error('Database connection failed');

            (prismaService.user.findMany as jest.Mock).mockRejectedValue(mockGenericError);

            await expect(prismaUserRepository.findAll())
                .rejects
                .toThrow('Failed to retrieve all users: Database connection failed');
        });
    });
});