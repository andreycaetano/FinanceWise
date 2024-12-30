import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { instanceToPlain } from 'class-transformer';
import { UserToken } from './interfaces/user-token.interface';
import { UserPayload } from './interfaces/userPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const data = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };

    const createdUser = this.repository.create(data);

    return instanceToPlain(await this.repository.save(createdUser)) as User;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.repository.findOneBy({ email });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return instanceToPlain(user) as User;
      }
    }

    throw new UnauthorizedException(
      'Email address or password provided is incorrect.',
    );
  }

  async login(user: User): Promise<UserToken> {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.repository.findOneBy({ email });

    if (user) {
      const token = this.jwtService.sign(
        { sub: user.id },
        { secret: process.env.JWT_SECRET_RESET_PASSWORD, expiresIn: '1h' },
      );
      await this.mailService.sendPasswordResetEmail(email, token);
    }
    return;
  }

  async resetPassword(token: string, newPassword: string) {
    let decoted;
    try {
      decoted = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_RESET_PASSWORD,
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.repository.findOneBy({ id: decoted.sub });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await this.repository.save(user);
  }
}
