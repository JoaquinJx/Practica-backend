
import { Body, Controller, Post, Get, Request, Put, Delete, Param } from "@nestjs/common";
import { CreateUserDto } from "src/users/application/dto/create.user.dto";
import { UserService } from "src/users/application/services/user.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Public } from "src/auth/decorators/public.decorator";
import { Role } from "src/auth/enums/role.enum";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    // Método público - no requiere autenticación
    @Public()
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    // Método requiere autenticación (guard global)
    @Get('profile')
    getProfile(@Request() req: any) {
        return this.userService.findByEmail(req.user.username);
    }

    // Método solo para ADMIN
    @Roles(Role.ADMIN)
    @Get('admin-only')
    getAdminData(@Request() req: any) {
        return {
            message: 'Este endpoint solo es accesible para administradores',
            user: req.user
        };
    }

    // Método para ADMIN o MODERATOR
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Get('moderator-admin')
    getModeratorOrAdminData(@Request() req: any) {
        return {
            message: 'Este endpoint es accesible para moderadores y administradores',
            user: req.user
        };
    }

    // Método solo para ADMIN - eliminar usuarios
    @Roles(Role.ADMIN)
    @Delete(':id')
    deleteUser(@Param('id') id: string, @Request() req: any) {
        return {
            message: `Usuario ${id} eliminado por ${req.user.username}`,
            deletedBy: req.user
        };
    }

    // Método autenticado - cualquier usuario autenticado
    @Put('profile')
    updateProfile(@Request() req: any, @Body() updateData: any) {
        return {
            message: 'Perfil actualizado',
            user: req.user.username,
            data: updateData
        };
    }
}
