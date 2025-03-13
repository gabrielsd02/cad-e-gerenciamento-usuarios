import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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

  async createUser(
    name: string,
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new ConflictException('E-mail já existente!');
    }

    const hashedPassword = await bcrypt.hash(pass, 8);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = newUser;
      return result;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      throw new Error(
        'Erro ao registrar o usuário. Tente novamente mais tarde.',
      );
    }
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

  async register(email: string, password: string, name: string) {
    const user = await this.createUser(name, email, password);
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

  async getUserFromToken(token: string) {
    try {
      const jwtDecoded: User = this.jwtService.verify(token);

      const user = await this.prisma.user.findUnique({
        where: {
          id: jwtDecoded.id,
          email: jwtDecoded.email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
