import { Controller, Get, Post, Put, Delete, UseGuards, Request, Body, Param } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

// Guards aplicados a TODO el controlador
@Controller('admin')
@UseGuards(AuthGuard) // Todos los métodos requieren autenticación
export class AdminController {
  
  // Este método hereda AuthGuard del controlador
  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return { 
      message: 'Dashboard accesible por cualquier usuario autenticado',
      user: req.user.username
    };
  }

  // Este método AÑADE RoleGuard además del AuthGuard del controlador
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  getUsers(@Request() req: any) {
    return { 
      message: 'Lista de usuarios - solo administradores',
      admin: req.user.username
    };
  }

  // Este método AÑADE RoleGuard con múltiples roles
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('reports')
  getReports(@Request() req: any) {
    return { 
      message: 'Reportes - administradores y moderadores',
      user: req.user.username,
      role: req.user.role
    };
  }

  // Este método AÑADE RoleGuard solo para ADMIN
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN)
  @Delete('user/:id')
  deleteUser(@Param('id') id: string, @Request() req: any) {
    return { 
      message: `Usuario ${id} eliminado`,
      deletedBy: req.user.username
    };
  }

  // Este método solo usa el AuthGuard del controlador
  @Get('profile')
  getProfile(@Request() req: any) {
    return { 
      message: 'Perfil del usuario actual',
      user: req.user
    };
  }
}
