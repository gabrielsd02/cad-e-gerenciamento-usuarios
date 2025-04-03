import { JwtService } from '@nestjs/jwt';
import { ConflictException, INestApplication } from '@nestjs/common';
import { UserTest } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from './../prisma/prisma.service';
import { UserTestService } from './user-test.service';
import { AppModule } from '../app.module';

describe('User Service', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userAdmin: UserTest;
  let idUser: number;

  const userService = new UserTestService(
    new JwtService(),
    new PrismaService(),
  );

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaService();

    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 8);

    const admin: UserTest = await prisma.userTest.create({
      data: {
        name: 'Admin Test',
        email: 'admin-service@test.com',
        password: passwordHash,
        role: 'ADMIN',
      },
    });
    userAdmin = admin;
  });

  afterAll(async () => {
    await prisma.userTest.deleteMany();
    await app.close();
  });

  describe('Create user', () => {
    it('Deve criar usuário com sucesso', async () => {
      const userToCreate = {
        email: 'newUserTest@gmail.com',
        name: 'User Test Created',
        dateBirth: new Date('2000-10-10'),
        phone: null,
        password: '123456',
        role: 'USER' as UserTest['role'],
      };

      const result = await userService.create(userToCreate);
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();

      const user = result as UserTest;
      expect(user.id).toBeDefined();
      expect(user.name).toContain('User Test Created');
      expect(user.email).toContain('newUserTest@gmail.com');
      idUser = user.id;
    });
    it('Deve criar usuário com erro de usuário ja existente', async () => {
      const userToCreate = {
        email: 'newUserTest@gmail.com',
        name: 'User Teste Created',
        dateBirth: new Date('2000-10-10'),
        phone: null,
        password: '123456',
        role: 'USER' as UserTest['role'],
      };

      await expect(userService.create(userToCreate)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Get user', () => {
    it('Deve retornar usuários', async () => {
      const result = await userService.getUsers({
        page: 1,
        recordsPerPage: 5,
        authUserId: 8,
      });
      expect(result.users.length).toBeGreaterThanOrEqual(2);
      expect(result.totalPages).toBeGreaterThanOrEqual(1);
      expect(result.totalRecords).toBeGreaterThanOrEqual(2);
    });

    it('Deve retornar usuário pelo id', async () => {
      const result = await userService.getById(userAdmin.id);
      expect(result).toBeDefined();
      expect(result!.id).toBe(userAdmin.id);
    });
  });

  describe('Update user', () => {
    it('Deve atualizar usuário com sucesso', async () => {
      const userToUpdate = await userService.getById(idUser);

      const result = await userService.update({
        id: idUser,
        dateBirth: userToUpdate?.dateBirth ?? null,
        phone: userToUpdate?.phone ?? null,
        role: 'USER',
        name: 'User Test Updated',
      });
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();

      const user = result as UserTest;
      expect(user.id).toBeDefined();
      expect(user.name).toContain('User Test Updated');
      expect(user.email).toContain(userToUpdate?.email);
    });

    it('Deve atualizar usuário com falha', async () => {
      const userToUpdate = await userService.getById(idUser);
      await expect(
        userService.update({
          id: 9999,
          dateBirth: userToUpdate?.dateBirth ?? null,
          phone: userToUpdate?.phone ?? null,
          role: 'USER',
          name: 'User Test Updated',
        }),
      ).rejects.toThrow(Error);
    });
  });

  describe('Delete user', () => {
    it('Deve remover usuário com sucesso', async () => {
      const result = await userService.delete(idUser);
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(idUser);
    });

    it('Deve remover usuário com falha', async () => {
      await expect(userService.delete(idUser)).rejects.toThrow(Error);
    });
  });
});
