import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class LoginDto {

    @IsEmail({},{message: 'Invalid email format'})
    @IsNotEmpty({message: 'Email is required'})
     readonly email: string;

    @IsString({message: 'Password must be a string'})
    @IsNotEmpty({message: 'Password is required'})
    @MinLength(6, {message: 'Password must be at least 6 characters long'})
    readonly password: string;

}