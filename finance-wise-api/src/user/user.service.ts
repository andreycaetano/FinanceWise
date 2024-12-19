import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.repository.findOne({ where: { email } });
  }

  async getOne(id: string): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return instanceToPlain(user) as User;
  }

  async update(id: string, updatedUserDto: UpdateUserDto): Promise<User> {
    await this.getOne(id);

    await this.repository.update(id, updatedUserDto);

    return instanceToPlain(await this.getOne(id)) as User;
  }

  private generateResetToken(userId: string): string {
    return this.jwtService.sign({ userId }, { expiresIn: '15m' });
  }
}
