import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'inPublic';
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
