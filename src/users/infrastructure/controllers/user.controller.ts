import { Body, 
    Controller, 
    Post, 
    Get, 
    Request, 
    Put, 
    Delete, 
    Param, 
    UsePipes, 
    ValidationPipe, 
    ParseUUIDPipe, 
    Query, 
    DefaultValuePipe, 
    ParseIntPipe, 
    Patch } from "@nestjs/common";

import { CreateUserDto } from "src/users/application/dto/create.user.dto";

import { UpdateUserDto } from "src/users/application/dto/update.user.dto";

import { UserService } from "src/users/application/services/user.service";

import { Roles } from "src/auth/decorators/roles.decorator";

import { Public } from "src/auth/decorators/public.decorator";

import { Role } from "src/auth/enums/role.enum";

import { 
    EmailNormalizationPipe,
    PasswordValidationPipe,
    RoleValidationPipe,
    NameValidationPipe,
    AvatarUrlValidationPipe
} from "../../application/pipes";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    // 🔓 CREAR USUARIO - Endpoint público con validación completa
    @Public()
    @Post()
    @UsePipes(new ValidationPipe({ 
        transform: true, 
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    // 🔍 OBTENER PERFIL - Usuario autenticado
    @Get('profile')
    getProfile(@Request() req: any) {
        return this.userService.findByEmail(req.user.username);
    }

    // 📋 LISTAR USUARIOS CON FILTROS - Solo Admin
    @Roles(Role.ADMIN)
    @Get()
    findUsers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('role', RoleValidationPipe) role?: Role
    ) {
        return {
            message: 'Lista de usuarios con filtros',
            filters: { page, limit, role },
            // TODO: Implementar paginación en el service
            users: this.userService.findAll()
        };
    }

    // 👤 OBTENER USUARIO POR ID - Admin y Moderador
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Get(':id')
    findUser(@Param('id', ParseUUIDPipe) id: string) {
        return this.userService.findById(id);
    }

    // 👑 ENDPOINT SOLO ADMIN
    @Roles(Role.ADMIN)
    @Get('admin-only')
    getAdminData(@Request() req: any) {
        return {
            message: 'Este endpoint solo es accesible para administradores',
            user: req.user
        };
    }

    // 👑🛡️ ENDPOINT ADMIN/MODERADOR
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Get('moderator-admin')
    getModeratorOrAdminData(@Request() req: any) {
        return {
            message: 'Este endpoint es accesible para moderadores y administradores',
            user: req.user
        };
    }

    // ✏️ ACTUALIZAR PERFIL PROPIO - Con validación de datos
    @Put('profile')
    @UsePipes(new ValidationPipe({ 
        transform: true, 
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true  // Permite campos opcionales en update
    }))
    updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(req.user.userId, updateUserDto);
    }

    // 🗑️ ELIMINAR USUARIO - Solo Admin con validación UUID
    @Roles(Role.ADMIN)
    @Delete(':id')
    deleteUser(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.userService.deleteUser(id);
    }

    // ✏️ ACTUALIZAR USUARIO ESPECÍFICO - Solo Admin con pipes personalizados
    @Roles(Role.ADMIN)
    @Put(':id')
    @UsePipes(new ValidationPipe({ 
        transform: true, 
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true
    }))
    updateUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: any
    ) {
        return this.userService.updateUser(id, updateUserDto);
    }

    // 🔍 BUSCAR USUARIOS POR EMAIL - Admin/Moderador con pipe de email
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Get('search/email/:email')
    findByEmail(@Param('email', EmailNormalizationPipe) email: string) {
        return this.userService.findByEmail(email);
    }

    // 👑 CAMBIAR ROL DE USUARIO - Solo Admin con validación de rol
    @Roles(Role.ADMIN)
    @Patch(':id/role')
    changeUserRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('role', RoleValidationPipe) role: Role,
        @Request() req: any
    ) {
        return this.userService.updateUser(id, { role });
    }
}
