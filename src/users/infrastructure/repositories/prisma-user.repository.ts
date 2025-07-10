// src/users/infrastructure/repositories/prisma-user.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { User, User1 } from 'src/users/domain/entities/user.entity';
import { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';
import { Prisma } from '@prisma/client';
import { CreateUser } from 'src/users/domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userEntity: CreateUser): Promise<User1> {
    try {
      const createdPrismaUser = await this.prisma.user.create({
        data:userEntity,
      });
      return createdPrismaUser as User1; // Asegúrate de que el tipo coincida con User1
    } catch (error) {
      console.error('Error al crear usuario en PrismaUserRepository:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // P2002: Violación de restricción única (ej. email ya existe)
        throw new Error(`Conflict: User with email "${userEntity.email}" already exists.`);
      }
      // Para cualquier otro error de Prisma o error inesperado, relanzar un Error genérico.
      // ¡Esto asegura que la función siempre lance un error si el try falla, cumpliendo con el tipo de retorno!
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async update(id: string, userEntity: Partial<User>): Promise<User | null> {
    try {
      const updatedPrismaUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...(userEntity.email && { email: userEntity.email }),
          ...(userEntity.password && { password: userEntity.password }),
          ...(userEntity.name && { name: userEntity.name }),
          ...(userEntity.avatarUrl && { avatarUrl: userEntity.avatarUrl }),
          ...(userEntity.role && { role: userEntity.role }),
        } as Prisma.UserUpdateInput,
      });
      return User.fromPersistence(updatedPrismaUser);
    } catch (error) {
      console.error('Error actualizando usuario en PrismaUserRepository:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // En este caso, devolver 'null' es un valor esperado y es parte del tipo de retorno (Promise<User | null>).
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error(`Conflict: email "${userEntity.email}" already in use.`);
      }
      throw new Error(`Failed to update user with ID ${id}: ${error.message}`);
    }
  }

  // Asegúrate de que todos tus métodos sigan esta lógica:
  // - Si el tipo de retorno es `Promise<Something>`, DEBE haber un `return Something;` o un `throw new Error();`
  // - Si el tipo de retorno es `Promise<Something | null>`, puedes devolver `null` explícitamente en ciertos casos de error.

  async delete(id: string): Promise<boolean> {
      try {
          await this.prisma.user.delete({ where: { id } });
          return true; // Devuelve true
      } catch (error) {
          console.error('Error eliminando usuario en PrismaUserRepository:', error);
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
              return false; // Devuelve false, que es un valor esperado en Promise<boolean>
          }
          throw new Error(`Failed to delete user with ID ${id}: ${error.message}`); // Relanza error
      }
  }

  async findById(id: string): Promise<User | null> {
      try {
          const prismaUser = await this.prisma.user.findUnique({ where: { id } });
          return prismaUser ? User.fromPersistence(prismaUser) : null; // Siempre devuelve User o null
      } catch (error) {
          console.error('Error buscando usuario por ID en PrismaUserRepository:', error);
          throw new Error(`Failed to retrieve user by ID ${id}: ${error.message}`); // Relanza error
      }
  }

  async findByEmail(email: string): Promise<User | null> {
      try {
          const prismaUser = await this.prisma.user.findUnique({ where: { email } });
          return prismaUser ? User.fromPersistence(prismaUser) : null; // Siempre devuelve User o null
      } catch (error) {
          console.error('Error buscando usuario por email en PrismaUserRepository:', error);
          throw new Error(`Failed to retrieve user by email ${email}: ${error.message}`); // Relanza error
      }
  }

  async findAll(): Promise<User[]> {
      try {
          const prismaUsers = await this.prisma.user.findMany();
          return prismaUsers.map(User.fromPersistence); // Siempre devuelve User[]
      } catch (error) {
          console.error('Error buscando todos los usuarios en PrismaUserRepository:', error);
          throw new Error(`Failed to retrieve all users: ${error.message}`); // Relanza error
      }
  }
}