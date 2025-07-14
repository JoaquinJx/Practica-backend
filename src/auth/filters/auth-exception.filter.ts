import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  ForbiddenException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { CUSTOM_ERROR_KEY, CustomErrorOptions } from '../decorators/custom-error.decorator';

@Catch(UnauthorizedException, ForbiddenException)
export class AuthExceptionFilter implements ExceptionFilter {
  constructor(private reflector: Reflector) {}

  catch(exception: UnauthorizedException | ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const message = exception.message;

    // Determinar el tipo de error
    const errorType = this.getErrorType(status, message);
    const userFriendlyMessage = this.getUserFriendlyMessage(errorType);

    // Log del error para debugging
    console.error(`[Auth Error] ${errorType}: ${message}`, {
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      userAgent: request.headers['user-agent'],
    });

    // Respuesta estructurada
    const errorResponse = {
      success: false,
      error: {
        type: errorType,
        message: userFriendlyMessage,
        details: message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
      // Sugerencias para el cliente
      suggestions: this.getSuggestions(errorType),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorType(status: number, message: string): string {
    if (status === HttpStatus.UNAUTHORIZED) {
      if (message.includes('No token provided')) {
        return 'MISSING_TOKEN';
      }
      if (message.includes('Invalid token')) {
        return 'INVALID_TOKEN';
      }
      if (message.includes('expired')) {
        return 'EXPIRED_TOKEN';
      }
      return 'UNAUTHORIZED';
    }

    if (status === HttpStatus.FORBIDDEN) {
      if (message.includes('role')) {
        return 'INSUFFICIENT_ROLE';
      }
      return 'FORBIDDEN_ACCESS';
    }

    return 'AUTH_ERROR';
  }

  private getUserFriendlyMessage(errorType: string): string {
    const messages = {
      MISSING_TOKEN: 'Acceso denegado. Se requiere autenticación.',
      INVALID_TOKEN: 'Token de autenticación inválido.',
      EXPIRED_TOKEN: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.',
      UNAUTHORIZED: 'No tienes autorización para acceder a este recurso.',
      INSUFFICIENT_ROLE: 'No tienes los permisos necesarios para realizar esta acción.',
      FORBIDDEN_ACCESS: 'Acceso prohibido.',
      AUTH_ERROR: 'Error de autenticación.',
    };

    return messages[errorType] || 'Error de autenticación desconocido.';
  }

  private getSuggestions(errorType: string): string[] {
    const suggestions = {
      MISSING_TOKEN: [
        'Incluye el token de autenticación en el header Authorization',
        'Formato: Authorization: Bearer <tu-token>',
        'Asegúrate de hacer login primero para obtener un token',
      ],
      INVALID_TOKEN: [
        'Verifica que el token sea válido',
        'Asegúrate de que el token no esté corrupto',
        'Intenta hacer login nuevamente para obtener un token fresco',
      ],
      EXPIRED_TOKEN: [
        'Realiza login nuevamente para obtener un nuevo token',
        'Implementa refresh token si es necesario',
      ],
      INSUFFICIENT_ROLE: [
        'Contacta al administrador para obtener los permisos necesarios',
        'Verifica que tu cuenta tenga el rol correcto',
      ],
      FORBIDDEN_ACCESS: [
        'Verifica que tengas los permisos correctos',
        'Contacta al administrador del sistema',
      ],
    };

    return suggestions[errorType] || [
      'Contacta al soporte técnico si el problema persiste',
    ];
  }
}
