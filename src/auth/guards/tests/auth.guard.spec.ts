import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth.guard';

describe('AuthGuard', () => {
    let authGuard: AuthGuard;
    let mockJwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        authGuard = module.get<AuthGuard>(AuthGuard);
        mockJwtService = module.get<JwtService>(JwtService);
    });

    const mockContext = {
        switchToHttp: () => ({
            getRequest: () => ({
                headers: {
                    authorization: 'Bearer valid-token'
                }
            }),
        }),
    } as ExecutionContext;

    it('should be defined', () => {
        expect(authGuard).toBeDefined();
    });

    it('should return true with valid token', async () => {
        // 1. Mockear que verifyAsync devuelve un payload válido
        const mockPayload = { username: 'testuser@example.com', sub: 'user-id' };
        (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

        // 2. Llamar a canActivate
        const result = await authGuard.canActivate(mockContext);

        // 3. Verificar que retorna true
        expect(result).toBe(true);
        
        // 4. Verificar que verifyAsync fue llamado con el token correcto
        expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
            secret: expect.any(String),
        });
    });

    it('should throw UnauthorizedException when no token provided', async () => {
        // 1. Crear un context sin authorization header
        const mockContextNoToken = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {} // Sin authorization header
                }),
            }),
        } as ExecutionContext;

        // 2. Verificar que lanza UnauthorizedException
        await expect(authGuard.canActivate(mockContextNoToken)).rejects.toThrow(
            new UnauthorizedException('No token provided')
        );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
        // 1. Mockear que verifyAsync lanza error (token inválido)
        (mockJwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        // 2. Verificar que lanza UnauthorizedException
        await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
            new UnauthorizedException('Invalid token')
        );
    });

    it('should add user to request when token is valid', async () => {
        // 1. Crear un request mock que podamos verificar
        const mockRequest = {
            headers: {
                authorization: 'Bearer valid-token'
            }
        };

        const mockContextWithRequest = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        // 2. Mockear payload específico
        const mockPayload = { username: 'testuser@example.com', sub: 'user-id' };
        (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

        // 3. Llamar a canActivate
        const result = await authGuard.canActivate(mockContextWithRequest);

        // 4. Verificar que retorna true
        expect(result).toBe(true);
        
        // 5. Verificar que el usuario fue agregado al request
        expect(mockRequest['user']).toEqual(mockPayload);
    });


});