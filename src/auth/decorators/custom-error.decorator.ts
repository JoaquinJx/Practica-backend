import { SetMetadata } from '@nestjs/common';

export const CUSTOM_ERROR_KEY = 'customError';

export interface CustomErrorOptions {
  unauthorized?: string;
  forbidden?: string;
  suggestions?: string[];
}

export const CustomErrorMessages = (options: CustomErrorOptions) =>
  SetMetadata(CUSTOM_ERROR_KEY, options);
