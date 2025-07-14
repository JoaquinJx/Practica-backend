import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Role } from '../../../auth/enums/role.enum';

@Injectable()
export class RoleValidationPipe implements PipeTransform {
  transform(value: any) {
    // If no role provided, default to 'user'
    if (!value) {
      return Role.USER;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Role must be a valid string');
    }

    const normalizedRole = value.toLowerCase().trim();
    
    // Validate against enum values
    const validRoles = Object.values(Role);
    if (!validRoles.includes(normalizedRole as Role)) {
      throw new BadRequestException(
        `Role must be one of the following: ${validRoles.join(', ')}`
      );
    }

    return normalizedRole as Role;
  }
}
