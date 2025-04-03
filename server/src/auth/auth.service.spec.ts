import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from './../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('Auth Service', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const secretAcessToken = process.env.SECRET_KEY_JWT;
  const authService = new AuthService(
    new PrismaService(),
    new JwtService({
      secret: secretAcessToken,
    }),
  );

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = new PrismaService();
    await app.init();

    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 8);

    await prisma.userTest.create({
      data: {
        name: 'User Test',
        email: 'user-auth@test.com',
        password: passwordHash,
        role: 'USER',
        dateBirth: new Date('2000-10-10'),
        phone: '48999999999',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Validate', () => {
    it('Deve validar usuário com erro de email', async () => {
      await expect(authService.validateUserTest('', '')).rejects.toThrow(
        'E-mail não encontrado!',
      );
    });

    it('Deve validar usuário com erro de senha inválida', async () => {
      await expect(
        authService.validateUserTest('user-auth@test.com', ''),
      ).rejects.toThrow('Senha incorreta!');
    });

    it('Deve validar usuário com sucesso', async () => {
      const result = await authService.validateUserTest(
        'user-auth@test.com',
        '123456',
      );
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe('user-auth@test.com');
    });
  });

  // Login
  it('Deve efetuar o login com sucesso', async () => {
    const result = await authService.loginTest('user-auth@test.com', '123456');
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.email).toBe('user-auth@test.com');
  });
});
