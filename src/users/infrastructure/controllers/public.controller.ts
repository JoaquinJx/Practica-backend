import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('public')
export class PublicController {
  
  // Método público - usando @Public()
  @Public()
  @Get('info')
  getPublicInfo() {
    return { 
      message: 'Esta información es pública',
      timestamp: new Date()
    };
  }

  // Método público - usando @Public()
  @Public()
  @Get('health')
  getHealthCheck() {
    return { 
      status: 'OK',
      message: 'Servicio funcionando correctamente'
    };
  }

  // Método que requiere autenticación
  // Si tienes guards globales, no necesitas especificar @UseGuards(AuthGuard)
  @Get('protected')
  getProtectedInfo(@Request() req: any) {
    return { 
      message: 'Esta información requiere autenticación',
      user: req.user.username
    };
  }

  // Método que requiere autenticación Y rol específico
  @Roles(Role.ADMIN)
  @Get('admin-info')
  getAdminInfo(@Request() req: any) {
    return { 
      message: 'Esta información es solo para administradores',
      admin: req.user.username
    };
  }

  // Método que requiere autenticación Y múltiples roles
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post('moderate')
  moderateContent(@Body() content: any, @Request() req: any) {
    return { 
      message: 'Contenido moderado',
      content,
      moderatedBy: req.user.username,
      role: req.user.role
    };
  }
}
