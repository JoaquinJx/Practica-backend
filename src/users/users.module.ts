import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "src/shared/services/prisma.module";
import { UserService } from "./application/services/user.service";
import { UserController } from "./infrastructure/controllers/user.controller";
import { AdminController } from "./infrastructure/controllers/admin.controller";
import { PublicController } from "./infrastructure/controllers/public.controller";
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => AuthModule)
    ],
    controllers: [UserController, AdminController, PublicController],
    providers: [
        {
            provide: 'IUserRepository',
            useClass: PrismaUserRepository // Using the correct repository implementation
        },
        UserService
    ],
    exports: [UserService]
})
export class UserModule {}