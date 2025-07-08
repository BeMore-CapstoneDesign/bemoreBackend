import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '../../common/interfaces/repositories.interface';
import { IUserService, UserResponse, AuthResponse } from '../../common/interfaces/services.interface';
import { CreateUserDto, LoginUserDto } from '../../common/dto/user.dto';

@Injectable()
export class UserDomainService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { email, password, name } = createUserDto;

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await this.userRepository.create({
      email,
      passwordHash,
      name,
    });

    return this.mapToResponse(user);
  }

  async authenticateUser(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    const { email, password } = loginUserDto;

    // 사용자 찾기
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // JWT 토큰 생성
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: this.mapToResponse(user),
    };
  }

  async findUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return this.mapToResponse(user);
  }

  private mapToResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
} 