import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The unique email address for the user' })
  @IsEmail({},{message:'Email must be a valid email address.'})
  @IsNotEmpty({message:'You cannot skip this field.'})
  email: string;

  @ApiProperty({description:'The user password (min 6 characters.'})
  @IsString({message:'Password must be chain characters.'})
  @MinLength(6,{message:'Password could have atleast 6 characters.'})
  @IsNotEmpty({message:'You cannot skip this field.'})
  password:string

  @ApiProperty({description:'The name of the user'})
  @IsOptional()
  @IsString({message:'Name must be chain characters.'})
  @IsNotEmpty({message:'You cannot skip this field if exists.'})
  name?: string

  @ApiProperty({description:'URL to the user avatar image'})
  @IsOptional()
  @IsUrl({},{message:'URL of avatar must be a valid URL.'})
  avatarUrl?:string

  @IsString()
  @IsOptional()
  role?: string;
}
