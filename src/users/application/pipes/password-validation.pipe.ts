import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PasswordValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Password must be a valid string');
    }

    const password = value.trim();

    // Minimum length validation
    if (password.length < 6) {
      throw new BadRequestException('Password must have at least 6 characters');
    }

    // Maximum length validation (security best practice)
    if (password.length > 128) {
      throw new BadRequestException('Password must not exceed 128 characters');
    }

    // Check for at least one letter and one number (optional but recommended)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
      throw new BadRequestException('Password must contain at least one letter and one number');
    }

    // Remove any potentially dangerous characters
    const sanitized = password.replace(/[<>'"&]/g, '');
    
    return sanitized;
  }
}
