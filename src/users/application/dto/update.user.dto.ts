import { IsOptional, IsString, MinLength, IsUrl, IsEmail, IsIn, IsEnum } from "class-validator";
import { CreateUserDto } from "./create.user.dto";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Role } from 'src/auth/enums/role.enum';

// Using PartialType to make all CreateUserDto fields optional
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({description:'The new email address for the user (optional)', required: false})
    @IsOptional()
    @IsEmail({},{message:'Email must be a valid email address.'})
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @ApiProperty({description:'The new password for the user (optional)', required: false})
    @IsOptional()
    @IsString({message:'Password must be a string of characters.'})
    @MinLength(6,{message:'Password must contain at least 6 characters.'})
    @Transform(({ value }) => value?.trim())
    password?: string;

    @ApiProperty({description:'The new name for the user (optional)', required: false})
    @IsOptional()
    @IsString({message:'Name must be a string of characters.'})
    @Transform(({ value }) => value?.trim())
    name?: string;

    @ApiProperty({description:'URL to the user avatar image (optional)', required: false})
    @IsOptional()
    @IsUrl({},{message:'Avatar URL must be a valid URL.'})
    avatarUrl?: string;

    @ApiProperty({description:'New role for the user (optional)', enum: Role, required: false})
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}