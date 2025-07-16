import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength, IsEnum, MaxLength } from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'The unique email address for the user' })
  @IsEmail({},{message:'Email must be a valid email address.'})
  @IsNotEmpty({message:'You cannot skip this field.'})
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({description:'The user password (min 6 characters)'})
  @IsString({message:'Password must be a string of characters.'})
  @MinLength(6,{message:'Password must have at least 6 characters.'})
  @MaxLength(20, { message: 'Password must not exceed 20 characters.' })
  @IsNotEmpty({message:'You cannot skip this field.'})
  @Transform(({ value }) => value.trim())
  password: string;

  @ApiProperty({description:'The name of the user'})
  @IsString({message:'Name must be a string of characters.'})
  @IsNotEmpty({message:'You cannot skip this field.'})
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({description:'URL to the user avatar image', required: false})
  @IsOptional()
  @IsUrl({},{message:'Avatar URL must be a valid URL.'})
  avatarUrl?: string;

  @ApiProperty({description:'User role in the system', enum: Role, default: Role.USER})
  @IsEnum(Role)
  @IsOptional()
  @Transform(({ value }) => value || Role.USER)
  role?: Role;
}
