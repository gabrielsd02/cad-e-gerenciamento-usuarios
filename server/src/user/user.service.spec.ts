import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from './../prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('User Service', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: UserService;
  const userServiceReal = new UserService(
    new JwtService(),
    new PrismaService(),
  );

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
  });

  it('Deve retornar usuários', async () => {
    const result = await userServiceReal.getUsers({
      page: 1,
      recordsPerPage: 5,
      authUserId: 8,
    });
    expect(result.users).toHaveLength(5);
    expect(result.totalPages).toBeGreaterThanOrEqual(1);
    expect(result.totalRecords).toBeGreaterThanOrEqual(5);
  });

  it('Deve retornar usuário pelo id', async () => {
    const result = await userServiceReal.getById(1);
    expect(result).toBeDefined();
    expect(result!.id).toBe(1);
  });
});
