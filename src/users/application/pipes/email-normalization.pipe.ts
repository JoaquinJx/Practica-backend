import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EmailNormalizationPipe implements PipeTransform {
  transform(value: any) {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Email must be a valid string');
    }

    // Normalize email: lowercase, trim whitespace
    const normalizedEmail = value.toLowerCase().trim();
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new BadRequestException('Email must be a valid email address');
    }

    return normalizedEmail;
  }
}
