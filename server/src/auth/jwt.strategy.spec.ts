import { User, UserTest } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { UserTestService } from '../user/user-test.service';
import { AppModule } from '../app.module';

describe('JwtStrategy', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userAuth: User;
  let jwtStrategy: JwtStrategy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useClass(UserTestService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
    await prisma.userTest.deleteMany();

    jwtStrategy = new JwtStrategy(prisma);
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

    jest.spyOn(prisma.user, 'findUnique').mockImplementation((args) => {
      return prisma.userTest.findUnique(args as any);
    });
  });

  afterAll(async () => {
    await prisma.userTest.deleteMany();
    await app.close();
  });

  describe('Validate', () => {
    it('Deve validar usuário com erro', async () => {
      const result = await jwtStrategy.validate({
        sub: 1,
      });
      expect(result).toBeNull();
    });

    it('Deve validar usuário com sucesso', async () => {
      const result = await jwtStrategy.validate({ sub: userAuth.id });

      expect(result).not.toBeNull();
      expect(result!.id).toBe(userAuth.id);
      expect(result!.email).toBe(userAuth.email);
      expect(result!.role).toBe(userAuth.role);
    });
  });
});
