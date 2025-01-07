import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { CategoriesService } from '../categories.service';

export class CategoryOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly categorySevice: CategoriesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const categoryId = request.params.id;

    if (user.role === 'ADMIN') {
      return true;
    }

    const category = await this.categorySevice.findOne(categoryId);

    if (!category || category.user.id !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this category.',
      );
    }

    return true;
  }
}
