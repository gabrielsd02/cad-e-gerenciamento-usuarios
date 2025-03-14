// user.service.ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';
import { GetUsersDto } from './dto/getUsers.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async getUsers(filters: GetUsersDto & { authUserId: number }) {
    const { search, page, recordsPerPage } = filters;

    const whereCondition = search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};
    const users = await this.prisma.user.findMany({
      omit: {
        password: true,
      },
      where: {
        ...whereCondition,
        id: { not: filters.authUserId },
      },
      skip: ((page ?? 1) - 1) * (recordsPerPage ?? 15),
      take: recordsPerPage,
      orderBy: { name: 'asc' },
    });
    const totalRecords = await this.prisma.user.count({
      where: {
        ...whereCondition,
        id: { not: filters.authUserId },
      },
    });
    return {
      users: users,
      totalRecords,
      totalPages: Math.ceil(totalRecords / (recordsPerPage ?? 15)),
      currentPage: page,
      recordsPerPage,
    };
  }

  async create({
    email,
    name,
    dateBirth,
    phone,
    password,
    role,
  }: Omit<User, 'id' | 'active' | 'registrationDate'>) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      throw new ConflictException('E-mail já existente!');
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          dateBirth,
          phone,
          role,
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

  async update({
    name,
    dateBirth,
    id,
    phone,
    role,
  }: Omit<User, 'email' | 'password' | 'active' | 'registrationDate'>) {
    try {
      const userUpdated = await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
          dateBirth,
          phone,
          role,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = userUpdated;
      return result;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      console.error(e);
      throw new Error(
        'Erro ao atualizar o usuário. Tente novamente mais tarde.',
      );
    }
  }

  async getById(userId: number) {
    const user = this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  }

  async delete(userId: number) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
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
