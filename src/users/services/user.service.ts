import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IUserRepository } from "../domain/interfaces/user.repository.interface";
import { User } from "../domain/entities/user.entity";
import * as bcrypt from 'bcryptjs';



@Injectable()
export class UserService{
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository:IUserRepository
    ){}
    //CREAR UN NUEVO USUARIO 
async createUser(userData:Partial<User>): Promise<User>{
    //TODO HASHEAR CONTRASENA
    const newUser= await this.userRepository.create(userData);
    return newUser;
}
//ACTUALIZAR USUARIO EXISTENTE
async updateUser(id:string,updateData:Partial<User> ): Promise<User>{
    const updatedUser= await this.userRepository.update(id,updateData)
    if(!updatedUser){
        throw new NotFoundException(`User id "${id}" not found.`)
    }
    return updatedUser;
}
//ELIMINAR USUARIO
async deleteUser(id:string):Promise<boolean>{
const deletedUser= await this.userRepository.delete(id)
if(!deletedUser){
    throw new NotFoundException(`User id "${id}" not found for deletion.`)
}
return deletedUser;
}
//BUSCAR POR ID
async findById(id:string):Promise<User>{
    const userId= await this.userRepository.findById(id)
    if(!userId){
        throw new NotFoundException(`User id "${id}" not found.`)
    }
    return userId;
}
//BUSCAR POR EMAIL
async findByEmail(email:string):Promise<User>{
    const userEmail= await this.userRepository.findByEmail(email);
    if(!userEmail){
        throw new NotFoundException(`User Email "${email}" not found.`)
    }
    return userEmail;

}
//TRAER TODOS LOS USUARIOS
async findAll():Promise<User[]>{
    const allUsers= await this.userRepository.findAll()
    if(!allUsers){
        throw new NotFoundException(`Users list "${allUsers}" not found.`)
    }
    return allUsers;
}
}
