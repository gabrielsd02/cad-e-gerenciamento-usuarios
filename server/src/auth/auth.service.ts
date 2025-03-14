import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail não encontrado!');
    }

    if (!(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Senha incorreta!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
      dateBirth: user.dateBirth,
      phone: user.phone,
      role: user.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      ...payload,
    };
  }
}
