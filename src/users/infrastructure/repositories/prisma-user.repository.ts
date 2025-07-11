// src/users/infrastructure/repositories/prisma-user.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { User, User1 } from 'src/users/domain/entities/user.entity';
import { IUserRepository } from 'src/users/domain/interfaces/user.repository.interface';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateUser } from 'src/users/domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userEntity: CreateUser): Promise<User1> {
    try {
      const createdPrismaUser = await this.prisma.user.create({
        data: userEntity,
      });
      return createdPrismaUser as User1;
    } catch (error) {
      console.error('Error al crear usuario en PrismaUserRepository:', error);

      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        // P2002: Violación de restricción única (ej. email ya existe)
        throw new Error(`Conflict: User with email "${userEntity.email}" already exists.`);
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async update(id: string, userEntity: Partial<User>): Promise<User | null> {
    try {
      const updateData: any = {};
      
      if (userEntity.email) updateData.email = userEntity.email;
      if (userEntity.password) updateData.password = userEntity.password;
      if (userEntity.name) updateData.name = userEntity.name;
      if (userEntity.avatarUrl) updateData.avatarUrl = userEntity.avatarUrl;
      if (userEntity.role) updateData.role = userEntity.role;

      const updatedPrismaUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      return User.fromPersistence(updatedPrismaUser);
    } catch (error) {
      console.error('Error actualizando usuario en PrismaUserRepository:', error);
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error(`Conflict: email "${userEntity.email}" already in use.`);
      }
      throw new Error(`Failed to update user with ID ${id}: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
      try {
          await this.prisma.user.delete({ where: { id } });
          return true;
      } catch (error) {
          console.error('Error eliminando usuario en PrismaUserRepository:', error);
          if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
              return false;
          }
          throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
      }
  }

  async findById(id: string): Promise<User | null> {
      try {
          const prismaUser = await this.prisma.user.findUnique({ where: { id } });
          return prismaUser ? User.fromPersistence(prismaUser) : null;
      } catch (error) {
          console.error('Error buscando usuario por ID en PrismaUserRepository:', error);
          throw new Error(`Failed to retrieve user by ID ${id}: ${error.message}`);
      }
  }

  async findByEmail(email: string): Promise<User | null> {
      try {
          const prismaUser = await this.prisma.user.findUnique({ where: { email } });
          return prismaUser ? User.fromPersistence(prismaUser) : null;
      } catch (error) {
          console.error('Error buscando usuario por email en PrismaUserRepository:', error);
          throw new Error(`Failed to retrieve user by email ${email}: ${error.message}`);
      }
  }

  async findAll(): Promise<User[]> {
      try {
          const prismaUsers = await this.prisma.user.findMany();
          return prismaUsers.map(User.fromPersistence);
      } catch (error) {
          console.error('Error buscando todos los usuarios en PrismaUserRepository:', error);
          throw new Error(`Failed to retrieve all users: ${error.message}`);
      }
  }
}