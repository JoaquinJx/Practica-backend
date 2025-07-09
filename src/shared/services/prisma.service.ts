import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }
  async onModuleInit() {
    //CONECTA AL CLIENTE DE PRISMA A LA BASE DE DATOS CUANDO EL MODULO SE INICIALIZA
    await this.$connect();
  }
  //AÑADE UN HOOK PARA DESCONECTAR PRISMA CUANDO LA APP SE CIERRA
  async enableShutDownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
      await this.$disconnect();
    });
  }
}
