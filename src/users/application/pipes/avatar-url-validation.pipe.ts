import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AvatarUrlValidationPipe implements PipeTransform {
  transform(value: any) {
    // If no URL provided, return null
    if (!value) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Avatar URL must be a valid string');
    }

    const trimmedUrl = value.trim();

    // Basic URL validation
    try {
      const url = new URL(trimmedUrl);
      
      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new BadRequestException('Avatar URL must use HTTP or HTTPS protocol');
      }

      // Check for common image extensions (optional)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        url.pathname.toLowerCase().endsWith(ext)
      );

      // If no image extension, check if it's a known image hosting service
      const imageHostingServices = [
        'imgur.com',
        'gravatar.com',
        'cloudinary.com',
        'unsplash.com',
        'pexels.com'
      ];

      const isImageHostingService = imageHostingServices.some(service =>
        url.hostname.includes(service)
      );

      if (!hasImageExtension && !isImageHostingService) {
        console.warn(`Avatar URL might not be an image: ${trimmedUrl}`);
      }

      return trimmedUrl;
    } catch (error) {
      throw new BadRequestException('Avatar URL must be a valid URL');
    }
  }
}
