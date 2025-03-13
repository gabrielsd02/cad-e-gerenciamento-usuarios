import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthHeaderDto } from './dto/auth-header.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const tokenAndData = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return {
      message: 'Login bem-sucedido',
      ...tokenAndData,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException(
        'A senha e a confirmação devem ser iguais.',
      );
    }
    const tokenAndData = await this.authService.register(
      registerDto.email,
      registerDto.name,
      registerDto.password,
    );
    return {
      message: 'Registro bem-sucedido, Bem-vindo!',
      ...tokenAndData,
    };
  }

  @Get('auth')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Headers() headers: AuthHeaderDto) {
    const token = headers?.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token não enviado');
    }

    const user = await this.authService.getUserFromToken(token);
    return {
      message: 'Informações do usuário recuperadas',
      user,
    };
  }
}
