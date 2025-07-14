import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The unique email address for the user' })
  @IsEmail({},{message:'Email must be a valid email address.'})
  @IsNotEmpty({message:'You cannot skip this field.'})
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({description:'The user password (min 6 characters)'})
  @IsString({message:'Password must be a string of characters.'})
  @MinLength(6,{message:'Password must have at least 6 characters.'})
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

  @ApiProperty({description:'User role in the system', enum: ['user','admin','moderator'], default: 'user'})
  @IsString()
  @IsOptional()
  @IsIn(['user','admin','moderator'],{message:'Role must be one of the following: user, admin, moderator.'})
  @Transform(({ value }) => value || 'user') // Default to 'user' if not provided
  role?: string;
}
