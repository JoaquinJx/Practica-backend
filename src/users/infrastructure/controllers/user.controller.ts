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
    Patch,
    UseInterceptors,
    UseGuards,
     } from "@nestjs/common";

import { CreateUserDto } from "src/users/application/dto/create.user.dto";

import { UpdateUserDto } from "src/users/application/dto/update.user.dto";

import { UserService } from "src/users/application/services/user.service";

import { Roles } from "src/auth/decorators/roles.decorator";

import { Public } from "src/auth/decorators/public.decorator";

import { Role } from "src/auth/enums/role.enum";

import { AuthGuard } from "src/auth/guards/auth.guard";

import { RoleGuard } from "src/auth/guards/role.guard";

import { 
    EmailNormalizationPipe,
    
    RoleValidationPipe,
    
} from "../../application/pipes";

import { ExecutionTimeInterceptor } from "../interceptors/execution-time.interceptor";


@Controller('users')
@UseInterceptors(ExecutionTimeInterceptor) // Interceptor para medir tiempo de ejecución

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
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return this.userService.findByEmail(req.user.username);
    }

    // 📋 LISTAR USUARIOS CON FILTROS - Solo Admin
    @UseGuards(RoleGuard)
    @Roles(Role.ADMIN)
    @Get()
    async findUsers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('role', RoleValidationPipe) role?: Role
    ) {
        return {
            message: 'Lista de usuarios con filtros',
            filters: { page, limit, role },
            // TODO: Implementar paginación en el service
            users: await this.userService.findAll()
        };
    }

    // 👤 OBTENER USUARIO POR ID - Admin y Moderador
    @UseGuards(RoleGuard)
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Get(':id')
    findUser(@Param('id', ParseUUIDPipe) id: string) {
        return this.userService.findById(id);
    }

    // 👑 ENDPOINT SOLO ADMIN
    @UseGuards(RoleGuard)
    @Roles(Role.ADMIN)
    @Get('admin-only')
    getAdminData(@Request() req: any) {
        return {
            message: 'Este endpoint solo es accesible para administradores',
            user: req.user
        };
    }

    // 👑🛡️ ENDPOINT ADMIN/MODERADOR
    @UseGuards(RoleGuard)
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Get('moderator-admin')
    getModeratorOrAdminData(@Request() req: any) {
        return {
            message: 'Este endpoint es accesible para moderadores y administradores',
            user: req.user
        };
    }

    // ✏️ ACTUALIZAR PERFIL PROPIO - Con validación de datos
    @UseGuards(AuthGuard)
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
    @UseGuards(RoleGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    deleteUser(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.userService.deleteUser(id);
    }

    // ✏️ ACTUALIZAR USUARIO ESPECÍFICO - Solo Admin con pipes personalizados
    @UseGuards(RoleGuard)
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
    @UseGuards(RoleGuard)
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Get('search/email/:email')
    findByEmail(@Param('email', EmailNormalizationPipe) email: string) {
        return this.userService.findByEmail(email);
    }

    // 👑 CAMBIAR ROL DE USUARIO - Solo Admin con validación de rol
    @UseGuards(RoleGuard)
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
