import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/services/prisma.module';
import { UserModule } from './users/users.module';



@Module({
  imports: [PrismaModule,UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
