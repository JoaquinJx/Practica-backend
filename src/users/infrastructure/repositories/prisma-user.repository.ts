import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { User } from "src/users/domain/entities/user.entity";
import { IUserRepository } from "src/users/domain/interfaces/user.repository.interface";


// @Injectable()
// export class PrismaUserRepository implements IUserRepository{
//     constructor(private readonly prisma:PrismaService){}
//     async findById(id: string): Promise<User | null> {
//         try {
//             const user=await this.prisma.user.findById()
//             return user
//         } catch (error) {
            
//         }
//     }
// }