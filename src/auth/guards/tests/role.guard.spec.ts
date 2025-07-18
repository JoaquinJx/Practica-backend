import { RoleGuard } from "../role.guard";
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/application/services/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Role } from '../../enums/role.enum';  

describe('RoleGuard', () => {
    let guard: RoleGuard;
    let mockReflector: Reflector;
    let mockJwtService: JwtService;
    let mockUserService: UserService;

    const mockContext = {
        switchToHttp: () => ({
            getRequest: () => ({
                headers: {
                    authorization: 'Bearer valid-token'
                }
            }),
        }),
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findByEmail: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<RoleGuard>(RoleGuard);
        mockReflector = module.get<Reflector>(Reflector);
        mockJwtService = module.get<JwtService>(JwtService);
        mockUserService = module.get<UserService>(UserService);
    });


    it('should be defined',()=> {
        //QUE ESTE DEFINIDO
        expect(guard).toBeDefined()
    })

    it('should allow access when no roles are required (public endpoint)', async () => {
        //CUANDO EL ROLL NO ES REQUERIDO 
        (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
});

    it('should throw UnauthorizedException when token is missing',async ()=>{
        //CUANDO NO HAY TOKEN
        const mockContextNoToken ={
            switchToHttp: () => ({
            getRequest: () => ({ headers: {} })
        }),
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        }as unknown as ExecutionContext;

        await expect(guard.canActivate(mockContextNoToken)).rejects.toThrow(UnauthorizedException); 
    })

    it('should throw UnauthorizedException when token is invalid',async()=>{
        //CUANDO EL TOKEN ES INVALIDO
        (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);
        (mockJwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));
        await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    })
    
    it('should throw UnauthorizedException when user is not found', async ()=>{
        //CUANDO EL USUARIO NO EXISTE
        (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);
        (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({ email: 'user@example.com' });
        (mockUserService.findByEmail as jest.Mock).mockResolvedValue(null);
        await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    })

    it('should throw allow acces when user has required role',async () =>{
        //CUANDDO EL USUARIO TIENE EL ROL REQUERIDO
        (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);
        (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({ email: 'user' });
        (mockUserService.findByEmail as jest.Mock).mockResolvedValue({
            email:'admin@test.com',
            role: Role.ADMIN
        })
        await expect(guard.canActivate(mockContext)).resolves.toBe(true);
    })
    
    it('should throw ForbiddenException when user lacks required role', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);
    (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({ email: 'user@test.com' });
    (mockUserService.findByEmail as jest.Mock).mockResolvedValue({ 
        email: 'user@test.com', 
        role: Role.USER 
    });
    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
});

})