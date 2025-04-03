import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { User, UserTest } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { UserTestService } from '../user/user-test.service';

describe('Auth Controller ', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokenUser: string;
  let userAuth: User;
  const secretAcessToken = process.env.SECRET_KEY_JWT;

  const userService = new UserTestService(
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
  const authController = new AuthController(userService, authService);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [PrismaService, JwtService, UserService, AuthService],
    })
      .overrideProvider(UserService)
      .useClass(UserTestService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
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

    userAuth = user;
    tokenUser = (await authService.loginTest(user.email, password)).accessToken;
  });

  afterAll(async () => {
    await prisma.userTest.deleteMany();
    await app.close();
  });

  describe('Authenticate', () => {
    it('Deve realizar a autenticação com erro', async () => {
      await expect(
        authController.authenticate({ authorization: 'test' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Deve realizar a autenticação com sucesso', async () => {
      const result = await authController.authenticate({
        authorization: `Bearer ${tokenUser}`,
      });

      expect(result.message).toContain('Informações do usuário recuperadas');
      expect(result.user.id).toBe(userAuth.id);
    });
  });

  describe('Login', () => {
    it('Deve realizar o login com erro', async () => {
      await expect(
        authController.login({
          email: 'login-test-error@gmail.com',
          password: '123456789',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Deve realizar o login com sucesso', async () => {
      const result = await authController.login({
        email: userAuth.email,
        password: '123456',
      });

      expect(result.message).toContain('Login bem-sucedido');
      expect(result.id).toBe(userAuth.id);
      expect(result.accessToken).toBeDefined();
    });
  });
});
