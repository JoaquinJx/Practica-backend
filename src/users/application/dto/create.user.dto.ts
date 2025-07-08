import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Dirección de correo electronico del usuario' })
  @IsEmail({})
  @IsNotEmpty({})
  email: string;
}
