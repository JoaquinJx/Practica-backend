import { RoleGuard } from "../role.guard";
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/application/services/user.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('RoleGuard', () => {
    let guard: RoleGuard;
    let mockReflector: Reflector;
    let mockJwtService: JwtService;
    let mockUserService: UserService;

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

})