import { Module } from "@nestjs/common";
import { PrismaModule } from "src/shared/services/prisma.module";


@Module({
    imports:[PrismaModule]
})
export class UserModule{}