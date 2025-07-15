
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
});