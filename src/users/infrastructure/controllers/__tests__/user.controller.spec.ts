
import { UserController } from "../user.controller";
import { UserService } from "src/users/application/services/user.service";
import { Test } from '@nestjs/testing';
import { Role } from "src/auth";

import { ConflictException } from "@nestjs/common";

describe('UserController', () => {

    let userController: UserController;
    let userService: UserService;

    const mockUserService = {
        createUser: jest.fn(),
        findByEmail: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService
                }
            ]
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);

        jest.clearAllMocks(); // Limpiar mocks antes de cada test
    });

    //ENDPOINT POST /users - Create User

    describe('POST /users - Create User', () => {

        //CASO DE EXITO 
        it('should create a user successfully', async () => {

            //DTO FICTICIO EXITOSO
            const createUserDto = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: Role.USER
            };

            //USUARIO EXITOSO CREADO
            const mockCreatedUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            //MOCK DEL SERVICIO
            mockUserService.createUser.mockResolvedValue(mockCreatedUser);

            //RESULTADO DE EJECUTAR METODO
            const result = await userController.create(createUserDto);

            //VERIFICAR RESULTADO
            expect(result).toEqual(mockCreatedUser);
            expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
            expect(mockUserService.createUser).toHaveBeenCalledTimes(1);
        });

        //CASO DE ERROR 
        it('should throw ConflictException when Email already exists', async () => {
            //DTO FICTICIO PARA EL ERROR
            const createUserDto = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: Role.USER
            };

            //MOCK DEL SERVICIO PARA ERROR
            mockUserService.createUser.mockRejectedValue(new ConflictException('Email already exists'));

            //VERIFICAR QUE SE LANCE LA EXCEPCION
            await expect(userController.create(createUserDto))
                .rejects
                .toThrow(ConflictException);

            expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
        });

    });

    describe('GET /users/profile', () => {
        
        //CASO DE EXITO 
        it('should get user profile successfully', async () => {
            
            //USUARIO AUTENTICADO FICTICIO
            const mockAuthenticatedUser = {
                user: {
                    username: 'test@example.com',
                    userId: '1',
                    role: Role.USER
                }
            };

            //USUARIO PROFILE DEVUELTO
            const mockUserProfile = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            //MOCK DEL SERVICIO
            mockUserService.findByEmail.mockResolvedValue(mockUserProfile);

            //RESULTADO DE EJECUTAR METODO
            const result = await userController.getProfile(mockAuthenticatedUser);

            //VERIFICAR RESULTADO
            expect(result).toEqual(mockUserProfile);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUserService.findByEmail).toHaveBeenCalledTimes(1);
        });

        //CASO DE ERROR - USUARIO NO ENCONTRADO
        it('should throw error when user is not found', async () => {
            
            //USUARIO AUTENTICADO FICTICIO
            const mockAuthenticatedUser = {
                user: {
                    username: 'nonexistent@example.com',
                    userId: '999',
                    role: Role.USER
                }
            };

            //MOCK DEL SERVICIO PARA ERROR
            mockUserService.findByEmail.mockResolvedValue(null);

            //RESULTADO DE EJECUTAR METODO
            const result = await userController.getProfile(mockAuthenticatedUser);

            //VERIFICAR RESULTADO
            expect(result).toBeNull();
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        });

        //CASO DE ERROR - SERVICIO LANZA EXCEPCION
        it('should throw error when service throws exception', async () => {
            
            //USUARIO AUTENTICADO FICTICIO
            const mockAuthenticatedUser = {
                user: {
                    username: 'test@example.com',
                    userId: '1',
                    role: Role.USER
                }
            };

            //MOCK DEL SERVICIO PARA ERROR
            mockUserService.findByEmail.mockRejectedValue(new Error('Database connection failed'));

            //VERIFICAR QUE SE LANCE LA EXCEPCION
            await expect(userController.getProfile(mockAuthenticatedUser))
                .rejects
                .toThrow('Database connection failed');

            expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
        });

    });

    describe('GET /users - List Users', () => {
        
        beforeEach(() => {
            jest.clearAllMocks(); // Asegurar que los mocks estén limpios para cada test
        });

        //CASO DE EXITO - SIN FILTROS (valores por defecto)
        it('should get users list successfully with default filters', async () => {
            
            //LISTA DE USUARIOS MOCK
            const mockUsersList = [
                {
                    id: '1',
                    email: 'user1@example.com',
                    name: 'User One',
                    role: Role.USER,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: '2',
                    email: 'admin@example.com',
                    name: 'Admin User',
                    role: Role.ADMIN,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            //MOCK DEL SERVICIO
            mockUserService.findAll.mockResolvedValue(mockUsersList);

            //RESULTADO DE EJECUTAR METODO (sin parámetros, usa defaults)
            const result = await userController.findUsers(1, 10);

            //VERIFICAR RESULTADO
            expect(result).toEqual({
                message: 'Lista de usuarios con filtros',
                filters: { page: 1, limit: 10, role: undefined },
                users: mockUsersList
            });
            expect(mockUserService.findAll).toHaveBeenCalledWith();
            expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
        });

        //CASO DE EXITO - CON FILTROS PERSONALIZADOS
        it('should get users list successfully with custom filters', async () => {
            
            //LISTA DE USUARIOS MOCK FILTRADA
            const mockFilteredUsersList = [
                {
                    id: '2',
                    email: 'admin@example.com',
                    name: 'Admin User',
                    role: Role.ADMIN,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            //MOCK DEL SERVICIO
            mockUserService.findAll.mockResolvedValue(mockFilteredUsersList);

            //RESULTADO DE EJECUTAR METODO CON FILTROS
            const result = await userController.findUsers(2, 5, Role.ADMIN);

            //VERIFICAR RESULTADO
            expect(result).toEqual({
                message: 'Lista de usuarios con filtros',
                filters: { page: 2, limit: 5, role: Role.ADMIN },
                users: mockFilteredUsersList
            });
            expect(mockUserService.findAll).toHaveBeenCalledWith();
            expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
        });

        //CASO DE EXITO - LISTA VACIA
        it('should return empty users list when no users found', async () => {
            
            //MOCK DEL SERVICIO CON LISTA VACIA
            mockUserService.findAll.mockResolvedValue([]);

            //RESULTADO DE EJECUTAR METODO
            const result = await userController.findUsers(1, 10);

            //VERIFICAR RESULTADO
            expect(result).toEqual({
                message: 'Lista de usuarios con filtros',
                filters: { page: 1, limit: 10, role: undefined },
                users: []
            });
            expect(mockUserService.findAll).toHaveBeenCalledWith();
        });

        //CASO DE ERROR - SERVICIO LANZA EXCEPCION
        it('should throw error when service throws exception', async () => {
            
            //MOCK DEL SERVICIO PARA ERROR
            mockUserService.findAll.mockRejectedValue(new Error('Database connection failed'));

            //VERIFICAR QUE SE LANCE LA EXCEPCION
            await expect(userController.findUsers(1, 10))
                .rejects
                .toThrow('Database connection failed');

            expect(mockUserService.findAll).toHaveBeenCalledWith();
        });

        //CASO DE EXITO - FILTRO SOLO POR ROLE
        it('should get users list with role filter only', async () => {
            
            //LISTA DE USUARIOS MOCK FILTRADA POR ROLE
            const mockUsersWithRole = [
                {
                    id: '3',
                    email: 'moderator@example.com',
                    name: 'Moderator User',
                    role: Role.MODERATOR,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            //MOCK DEL SERVICIO
            mockUserService.findAll.mockResolvedValue(mockUsersWithRole);

            //RESULTADO DE EJECUTAR METODO CON FILTRO DE ROLE
            const result = await userController.findUsers(1, 10, Role.MODERATOR);

            //VERIFICAR RESULTADO
            expect(result).toEqual({
                message: 'Lista de usuarios con filtros',
                filters: { page: 1, limit: 10, role: Role.MODERATOR },
                users: mockUsersWithRole
            });
            expect(mockUserService.findAll).toHaveBeenCalledWith();
        });

    });
    
    describe('GET /users/:id - Find User by Id', () => {

        beforeEach(() => {
            jest.clearAllMocks(); // Asegurar que los mocks estén limpios para cada test
        });

        //CASO DE EXITO USUARIO ENCONTRADO 
        it('should find user by id successfully', async () => {
            const userId = '1';
            const mockUser = {
                id: '1',
                email: 'user1@example.com',
                name: 'User One',
                role: Role.USER,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockUserService.findById.mockResolvedValue(mockUser);

            const result = await userController.findUser(userId);

            expect(result).toEqual(mockUser);
            expect(mockUserService.findById).toHaveBeenCalledWith(userId);
            expect(mockUserService.findById).toHaveBeenCalledTimes(1);
        });

        //CASO DE ERROR USUARIO NO ENCONTRADO
        it('should return null when user not found', async () => {
            const userId = '9999999';

            mockUserService.findById.mockResolvedValue(null);

            const result = await userController.findUser(userId);

            expect(result).toBeNull();
            expect(mockUserService.findById).toHaveBeenCalledWith(userId);
            expect(mockUserService.findById).toHaveBeenCalledTimes(1);
        });

        //CASO DE ERROR SERVICIO LANZA EXCEPCION
        it('should throw error when service throws exception', async () => {
            const userId = '1';

            mockUserService.findById.mockRejectedValue(new Error('Database connection failed'));   
            
            await expect(userController.findUser(userId))
                .rejects
                .toThrow('Database connection failed'); 

            expect(mockUserService.findById).toHaveBeenCalledWith(userId);
        });

    });
});