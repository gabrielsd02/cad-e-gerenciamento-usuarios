import {
  INestApplication,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserTest } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';
import { UserTestService } from '../user/user-test.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('JwtAuthGuard', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtAuthGuard: JwtAuthGuard;
  let context: ExecutionContext;
  let tokenUser: string;
  let userService: UserTestService;
  const secretAcessToken = process.env.SECRET_KEY_JWT;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        PrismaService,
        JwtService,
        {
          provide: UserService,
          useClass: UserTestService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    const jwtService = moduleFixture.get<JwtService>(JwtService);

    userService = new UserTestService(
      new JwtService({
        secret: secretAcessToken,
      }),
      new PrismaService(),
    );

    const authService = new AuthService(
      new PrismaService(),
      new JwtService({
        secret: secretAcessToken,
      }),
    );

    await app.init();
    await prisma.userTest.deleteMany();

    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 8);

    const user: UserTest = await prisma.userTest.create({
      data: {
        name: 'User Test',
        email: 'user-auth@test.com',
        password: passwordHash,
        role: 'USER',
        dateBirth: new Date('2000-10-10'),
        phone: '48999999999',
      },
    });
    tokenUser = (await authService.loginTest(user.email, password)).accessToken;

    jwtAuthGuard = new JwtAuthGuard(
      jwtService,
      userService as unknown as UserService,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    context = {
      switchToHttp: () => ({
        getRequest: jest.fn(),
      }),
    } as any;
  });

  it('Deve negar acesso se não houver token', async () => {
    const request = { headers: {} };
    jest.spyOn(context, 'switchToHttp').mockReturnValue({
      getRequest: () => request,
    } as any);

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token não fornecido'),
    );
  });

  it('Deve negar acesso se o token for inválido', async () => {
    const request = { headers: { authorization: 'Bearer' } };
    jest.spyOn(context, 'switchToHttp').mockReturnValue({
      getRequest: () => request,
    } as any);

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Formato do token inválido'),
    );
  });

  it('Deve negar acesso se o token for inválido ou expirado', async () => {
    const request = { headers: { authorization: 'Bearer invalid.token' } };
    jest.spyOn(context, 'switchToHttp').mockReturnValue({
      getRequest: () => request,
    } as any);

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado'),
    );
  });

  it('Deve permitir acesso se o token for válido', async () => {
    const request = { headers: { authorization: `Bearer ${tokenUser}` } };
    jest.spyOn(context.switchToHttp(), 'getRequest').mockReturnValue(request);

    const result = await jwtAuthGuard.canActivate(context);
    expect(result).toBe(true);
  });
});
