import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/domain/entities/user.entity";

//PLANTILLA DE RESPUESTA QUE SE GENERA AL CREAR/ACTUALIZAR USUARIO 
export class UserResponseDto{

 @ApiProperty({ description: 'The unique identifier of the user', example: 'clx0p01qc000008jt22l4a1a3' })
  id: string;

  @ApiProperty({ description: 'The unique email address of the user', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'The name of the user', example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ description: 'URL to the user\'s avatar image', example: 'https://example.com/avatar.jpg', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ description: 'The role of the user (e.g., "user", "admin")', example: 'user' })
  role: string;

  @ApiProperty({ description: 'The creation timestamp of the user', example: '2023-10-27T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp of the user', example: '2023-10-27T11:30:00Z' })
  updatedAt: Date;
  
  constructor(user:User){
    this.id=user.id;
    this.email=user.email;
    this.name=user.name ||null ;
    this.avatarUrl=user.avatarUrl || null;
    this.role=user.role;
    this.createdAt=user.createAt;
    this.updatedAt=user.updateAt;

  }
}