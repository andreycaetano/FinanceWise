import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    user: User,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const findCategory = await this.categoryRepository.findOne({
      where: { name: ILike(createCategoryDto.name) },
      withDeleted: true,
    });

    if (findCategory) {
      if (findCategory.deletedAt === null) {
        throw new ConflictException(
          `Category ${createCategoryDto.name} already exists`,
        );
      } else if (findCategory.deletedAt) {
        throw new ConflictException(
          `Category ${createCategoryDto.name} already exists, reactivate it.`,
        );
      }
    }

    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      user,
    });
    return instanceToPlain(
      await this.categoryRepository.save(newCategory),
    ) as Category;
  }

  async findAll(user: User): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { user: user },
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return instanceToPlain(category) as Category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    const findCategoryByName = await this.categoryRepository.findOne({
      where: { name: updateCategoryDto.name },
      withDeleted: true,
    });

    if (findCategoryByName) {
      if (findCategoryByName.deletedAt === null) {
        throw new ConflictException(
          `Category ${updateCategoryDto.name} already exists, reactivate it.`,
        );
      }
      throw new ConflictException(
        `Category ${updateCategoryDto.name} already exists`,
      );
    }

    Object.assign(category, updateCategoryDto);

    return instanceToPlain(
      await this.categoryRepository.save(category),
    ) as Category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    await this.categoryRepository.softRemove(category);
  }
}
