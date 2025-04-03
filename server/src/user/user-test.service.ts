import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class UserTestService {
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
    const users = await this.prisma.userTest.findMany({
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
    const totalRecords = await this.prisma.userTest.count({
      where: {
        ...whereCondition,
        id: { not: filters.authUserId },
      },
    });
    return {
      users,
      totalRecords,
      totalPages: Math.ceil(totalRecords / (recordsPerPage ?? 15)),
      currentPage: page ?? 1,
      recordsPerPage: recordsPerPage ?? 15,
    };
  }

  async create({
    email,
    name,
    dateBirth,
    phone,
    password,
    role,
  }: Omit<User, 'id' | 'active' | 'registrationDate'>): Promise<
    Error | Omit<User, 'password'>
  > {
    const user = await this.prisma.userTest.findUnique({
      where: { email },
    });
    if (user) {
      throw new ConflictException('E-mail já existente!');
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    try {
      const newUser = await this.prisma.userTest.create({
        data: {
          name,
          email,
          dateBirth,
          phone,
          role,
          password: hashedPassword,
        },
      });
      if (!newUser) {
        throw new BadRequestException(
          'Erro ao criar o usuário, verifique as informações enviadas',
        );
      }

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
    id,
    name,
    dateBirth,
    phone,
    role,
  }: Omit<User, 'email' | 'password' | 'active' | 'registrationDate'>) {
    try {
      const userUpdated = await this.prisma.userTest.update({
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
      throw new Error(
        'Erro ao atualizar o usuário. Tente novamente mais tarde.',
      );
    }
  }

  async getById(userId: number) {
    const user = this.prisma.userTest.findUnique({
      where: { id: userId },
    });
    return user;
  }

  async delete(userId: number) {
    try {
      return this.prisma.userTest.delete({
        where: { id: userId },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      throw new Error('Erro ao remover o usuário. Tente novamente mais tarde.');
    }
  }

  async getUserFromToken(token: string) {
    try {
      const jwtDecoded: User = this.jwtService.verify(token);
      const user = await this.prisma.userTest.findUnique({
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
