
import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "src/users/application/dto/create.user.dto";
import { UserService } from "src/users/application/services/user.service";

@Controller('users')
export class UserController{
    constructor(private readonly userService:UserService){}
    
    @Post()
    create(@Body() createUserDto:CreateUserDto){
        return this.userService.createUser(createUserDto)
    }
   
}
