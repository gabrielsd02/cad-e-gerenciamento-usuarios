import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { User, UserTest } from '@prisma/client';
import { UserService } from './user.service';
import { UserTestService } from './user-test.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

// CRUD User and yours rules
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let tokenUser: string;
  let tokenAdmin: string;
  let tokenManager: string;
  let idUser: number;
  let idAdmin: number;
  let newUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useClass(UserTestService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaService();
    authService = moduleFixture.get(AuthService);

    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 8);

    const user: UserTest = await prisma.userTest.create({
      data: {
        name: 'User Test',
        email: 'user@test.com',
        password: passwordHash,
        role: 'USER',
      },
    });

    const admin: UserTest = await prisma.userTest.create({
      data: {
        name: 'Admin Test',
        email: 'admin@test.com',
        password: passwordHash,
        role: 'ADMIN',
      },
    });

    const manager: UserTest = await prisma.userTest.create({
      data: {
        name: 'Manager Test',
        email: 'manager@test.com',
        password: passwordHash,
        role: 'MANAGER',
      },
    });

    idUser = user.id;
    idAdmin = admin.id;
    tokenUser = (await authService.loginTest(user.email, password)).accessToken;
    tokenManager = (await authService.loginTest(manager.email, password))
      .accessToken;
    tokenAdmin = (await authService.loginTest(admin.email, password))
      .accessToken;
  });

  afterAll(async () => {
    await prisma.userTest.deleteMany();
    await app.close();
  });

  // create
  describe('/user (POST)', () => {
    it('❌ Deve bloquear um usuário comum de criar outro usuário', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          name: 'Novo Usuário',
          email: 'novo@teste.com',
          password: '123456',
        });
      expect(response.status).toBe(403);
      const body = response.body as {
        message: string;
      };
      expect(body.message).toContain('Acesso negado para esta ação');
    });

    it('✅ Deve permitir que um admin crie um novo usuário', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${tokenAdmin} test`)
        .send({
          name: 'Novo Usuário',
          email: 'novo@teste.com',
          password: '123456',
          role: 'USER',
        });
      const body = response.body as {
        message: string;
        id: number;
      };
      newUserId = body.id;
      expect(response.status).toBe(200);
      expect(body.message).toContain('Usuário cadastrado com sucesso!');
      expect(response.body).toHaveProperty('id');
    });
  });

  // read
  describe('/users & /user/{id} (GET)', () => {
    it('✅ Deve permitir um usuario comum liste usuários', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${tokenUser}`);

      const body = response.body as {
        users: User[];
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        recordsPerPage: number;
      };
      expect(response.status).toBe(200);
      expect(body.totalRecords).toBeGreaterThanOrEqual(2);
      expect(body.totalPages).toBe(1);
      expect(body.currentPage).toBe(1);
      expect(body.users.length).toBeGreaterThanOrEqual(2);
    });

    it('✅ Deve permitir um usuario admin consultar um usuário pelo id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/${newUserId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const body = response.body as User;
      expect(response.status).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body.id).toBe(newUserId);
    });
  });

  // update
  describe('/user/{id} (PUT)', () => {
    it('❌ Deve bloquear um usuário comum de alterar os dados de outro usuário', async () => {
      const response = await request(app.getHttpServer())
        .put(`/user/${newUserId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          name: 'Novo Usuário Atualizado',
          email: 'novo@teste.com',
          role: 'USER',
        });
      const body = response.body as {
        message: string;
      };
      expect(response.status).toBe(403);
      expect(body.message).toContain('Você não possui permissão');
    });

    it('❌ Deve bloquear um usuário do tipo gerente de alterar os dados do usuário ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .put(`/user/${idAdmin}`)
        .set('Authorization', `Bearer ${tokenManager}`)
        .send({
          name: 'Novo Usuário Atualizado',
          email: 'novo@teste.com',
          role: 'USER',
        });
      const body = response.body as {
        message: string;
      };

      expect(response.status).toBe(403);
      expect(body.message).toContain('Você não possui permissão');
    });

    it('✅ Deve permitir que um usuário comum altere seus próprios dados', async () => {
      const response = await request(app.getHttpServer())
        .put(`/user/${idUser}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
          name: 'User Test Updated',
        });
      const body = response.body as {
        message: string;
        user: User;
      };

      expect(response.status).toBe(200);
      expect(body.message).toContain('Usuário atualizado com sucesso!');
      expect(body.user.name).toBe('User Test Updated');
      expect(body.user).toHaveProperty('id');
      expect(body.user.id).toBe(idUser);
    });

    it('✅ Deve permitir que um usuário do tipo gerente altere os dados de um usuário comun', async () => {
      const response = await request(app.getHttpServer())
        .put(`/user/${newUserId}`)
        .set('Authorization', `Bearer ${tokenManager}`)
        .send({
          name: 'Novo Usuário Atualizado',
        });
      const body = response.body as {
        message: string;
        user: User;
      };

      expect(response.status).toBe(200);
      expect(body.message).toContain('Usuário atualizado com sucesso!');
      expect(body.user.name).toBe('Novo Usuário Atualizado');
      expect(body.user).toHaveProperty('id');
      expect(body.user.id).toBe(newUserId);
    });
  });

  // delete
  describe('/user/{id} (DELETE)', () => {
    it('❌ Deve bloquear um usuário comum de excluir um usuario', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/user/${newUserId}`)
        .set('Authorization', `Bearer ${tokenUser}`);
      const body = response.body as {
        message: string;
      };

      expect(response.status).toBe(403);
      expect(body.message).toContain('Acesso negado para esta ação');
    });
    it('❌ Deve bloquear um usuário do tipo gerente de excluir um usuario', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/user/${newUserId}`)
        .set('Authorization', `Bearer ${tokenManager}`);
      const body = response.body as {
        message: string;
      };

      expect(response.status).toBe(403);
      expect(body.message).toContain('Acesso negado para esta ação');
    });
    it('✅ Deve permitir o usuário admin exclua um usuário', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/user/${newUserId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      const body = response.body as {
        message: string;
      };

      expect(response.status).toBe(200);
      expect(body.message).toContain('Usuário deletado com sucesso!');
    });
  });
});
