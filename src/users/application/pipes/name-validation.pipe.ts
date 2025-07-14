import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class NameValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Name must be a valid string');
    }

    const trimmedName = value.trim();

    // Check minimum length
    if (trimmedName.length < 2) {
      throw new BadRequestException('Name must have at least 2 characters');
    }

    // Check maximum length
    if (trimmedName.length > 50) {
      throw new BadRequestException('Name must not exceed 50 characters');
    }

    // Remove any potentially dangerous characters but keep spaces and common name characters
    const sanitizedName = trimmedName.replace(/[<>'"&@#$%^*(){}[\]|\\]/g, '');

    // Check if name contains only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(sanitizedName)) {
      throw new BadRequestException('Name can only contain letters, spaces, hyphens, and apostrophes');
    }

    // Capitalize first letter of each word
    const capitalizedName = sanitizedName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return capitalizedName;
  }
}
