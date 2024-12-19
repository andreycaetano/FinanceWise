import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserOwnerGuard } from './guard/user-owner.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOne(@Param('id') id: string) {
    return this.userService.getOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, UserOwnerGuard)
  update(@Param('id') id: string, @Body() updatedUserDto: UpdateUserDto) {
    return this.userService.update(id, updatedUserDto);
  }
}
