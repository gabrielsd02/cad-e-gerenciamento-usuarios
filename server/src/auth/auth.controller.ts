import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { HeaderDto } from '../dto/header-dto';
import { UserService } from '../user/user.service';
import { UserTestService } from '../user/user-test.service';

@Controller()
export class AuthController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService | UserTestService,
    private readonly authService: AuthService,
  ) {}

  @Get('auth')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Headers() headers: HeaderDto) {
    const token = headers?.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token não enviado');
    }
    const user = await this.userService.getUserFromToken(token);
    return {
      message: 'Informações do usuário recuperadas',
      user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const tokenAndData = await this.authService.loginTest(
      loginDto.email,
      loginDto.password,
    );
    return {
      message: 'Login bem-sucedido',
      ...tokenAndData,
    };
  }
}
