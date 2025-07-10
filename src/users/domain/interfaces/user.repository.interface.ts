
import { CreateUser, User, User1 } from '../entities/user.entity'; // Importa la CLASE User

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  // El método 'create' recibe una CLASE User (parcial)
  create(user: CreateUser): Promise<User1>;
  // El método 'update' recibe una CLASE User (parcial)
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<User[]>;
}
