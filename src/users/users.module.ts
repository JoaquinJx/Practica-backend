import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/services/prisma.module";
import { PrismaService } from "src/shared/services/prisma.service";
import { UserService } from "./application/services/user.service";
import { UserController } from "./infrastructure/controllers/user.controller";


@Module({
    imports:[PrismaModule],
    controllers:[UserController],
    providers:[
        {
            provide: 'IUserRepository',
            useClass: PrismaService // PrismaService acts as the repository for User
        },
        UserService
    ],
    exports:[UserService]
})
export class UserModule{}