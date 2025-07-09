import { IsOptional, IsString, MinLength, IsUrl } from "class-validator";
import { CreateUserDto } from "./create.user.dto";
import { ApiProperty, PartialType } from "@nestjs/swagger";

//USAMOS PARTIALTYPE PARA EVITAR TRAER CAMPOS INNECESARIOS

export class UpdateUserDto extends PartialType(CreateUserDto){
    @ApiProperty({description:'The new password for the user (opcional).'})
    @IsOptional()
    @IsString({message:'Password must be a chain of characters.'})
    @MinLength(6,{message:'Password must contain atleast 6 characters.'})
    password?: string

    @ApiProperty({description:'URL to the user avatar image'})
    @IsOptional()
    @IsUrl({},{message:'URL of avatar must be a valid URL.'})
    avatarUrl?:string

}