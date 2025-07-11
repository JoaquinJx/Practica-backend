// src/users/application/user.service.ts

import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common'; // Importa las excepciones de NestJS
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { CreateUserDto } from '../dto/create.user.dto';
import { UpdateUserDto } from '../dto/update.user.dto';


// No necesitas importar tus excepciones de dominio personalizadas si no las tienes.
// import { UserNotFoundException, UserEmailConflictException, UserRepositoryException } from '../domain/exceptions/user.exceptions';

// import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(createDto: CreateUserDto){
    
    
    return this.userRepository.create(createDto)


  }

 

  async updateUser(id: string, updateDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado durante la operación de actualización.`);
    }
    

    try {
      const updatedUser = await this.userRepository.update(id, existingUser);
      if (!updatedUser) { // Si el repositorio devuelve null, significa que no se encontró para actualizar
        throw new NotFoundException(`Usuario con ID "${id}" no encontrado durante la operación de actualización.`);
      }
      return updatedUser;
    } catch (error) {
      console.error('Error en UserService al actualizar usuario:', error);
      if (error.message.includes('email already in use')) { // Convención para errores de conflicto de email
        throw new ConflictException(`No se puede actualizar el usuario: el email "${updateDto.email}" ya está en uso.`);
      }
      throw new Error('No se pudo procesar la solicitud de actualización de usuario.');
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`); // Lanza NotFoundException aquí
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`Usuario con email "${email}" no encontrado.`); // Lanza NotFoundException aquí
    }
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const deleted = await this.userRepository.delete(id);
      if (!deleted) {
        throw new NotFoundException(`Usuario con ID "${id}" no encontrado para eliminación.`); // Lanza NotFoundException aquí
      }
      return true;
    } catch (error) {
      console.error('Error en UserService al eliminar usuario:', error);
      throw new Error('No se pudo procesar la solicitud de eliminación de usuario.');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}