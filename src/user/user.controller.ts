import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UserDomainService } from '../domain/services/user-domain.service';
import { CreateUserDto, LoginUserDto } from '../common/dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserDomainService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.authenticateUser(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.findUserById(req.user.userId);
  }
} 