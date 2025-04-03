import { User } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PermissionsGuard } from '../casl/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CaslAbilityFactory } from '../casl/caslAbility.factory';

describe('User Controller', () => {
  let controller: UserController;
  let userService: UserService;
  const userServiceReal = new UserService(
    new JwtService(),
    new PrismaService(),
  );

  const instanceAndValidateDto = async (plain: object) => {
    const instanceDto = plainToInstance(CreateUserDto, {
      ...plain,
    });
    return await validate(instanceDto);
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      controllers: [UserController],
      providers: [
        PermissionsGuard,
        CaslAbilityFactory,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            getById: jest.fn(),
            getUsers: (...args: Parameters<UserService['getUsers']>) =>
              userServiceReal.getUsers(...args),
          },
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
  });

  describe('DTOs', () => {
    it('Deve testar comportamento do nome do usuário via DTO', async () => {
      const nameNumber = 1234;
      const nameLessFour = 'joe';
      const nameStringNumber = 'jack13';

      const errorsNameNumber = await instanceAndValidateDto({
        name: nameNumber,
      });
      const errorsNameLessFour = await instanceAndValidateDto({
        name: nameLessFour,
      });
      const errorsNameStringNumber = await instanceAndValidateDto({
        name: nameStringNumber,
      });

      expect(errorsNameNumber.length).toBeGreaterThan(0);
      expect(errorsNameLessFour.length).toBeGreaterThan(0);
      expect(errorsNameStringNumber.length).toBeGreaterThan(0);

      const userNameNumberErrorMessage =
        errorsNameNumber.find((e) => e.property === 'name')?.constraints!
          .isString ?? undefined;
      const userNameLessErrorMessage =
        errorsNameLessFour.find((e) => e.property === 'name')?.constraints!
          .minLength ?? undefined;
      const userNameStringNumberErrorMessage =
        errorsNameStringNumber.find((e) => e.property === 'name')?.constraints!
          .matches ?? undefined;

      expect(userNameNumberErrorMessage).not.toBeUndefined();
      expect(userNameLessErrorMessage).not.toBeUndefined();
      expect(userNameStringNumberErrorMessage).not.toBeUndefined();
      expect(userNameNumberErrorMessage).toContain(
        `O nome deve ser do tipo string`,
      );
      expect(userNameLessErrorMessage).toContain(
        `O nome deve ter pelo menos 4 caracteres`,
      );
      expect(userNameStringNumberErrorMessage).toContain(
        `O nome deve conter apenas letras`,
      );
    });

    it('Deve testar comportamento do email do usuário via DTO', async () => {
      const mockUserWithEmail = {
        email: 'mockUser',
      };
      const mockUserWithoutEmail = {
        email: undefined,
      };

      const errorsUserWithEmail =
        await instanceAndValidateDto(mockUserWithEmail);
      const errorsUserWithoutEmail =
        await instanceAndValidateDto(mockUserWithoutEmail);

      expect(errorsUserWithEmail.length).toBeGreaterThan(0);
      expect(errorsUserWithoutEmail.length).toBeGreaterThan(0);

      const validationErrorWihoutEmailTarget =
        errorsUserWithoutEmail[1]?.constraints;
      const errorWihoutEmailMessage = validationErrorWihoutEmailTarget!.isEmail;

      const validationErrorWidthEmailTarget =
        errorsUserWithEmail[1]?.constraints;
      const errorWithEmailMessage = validationErrorWidthEmailTarget!.isEmail;
      expect(errorWihoutEmailMessage).toContain(
        `O email enviado deve ser um endereço de email válido`,
      );
      expect(errorWithEmailMessage).toContain(
        `O email enviado deve ser um endereço de email válido`,
      );
    });

    it('Deve testar comportamento do telefone do usuário via DTO', async () => {
      const phone = 123456789;
      const errorsPhone = await instanceAndValidateDto({ phone });

      expect(errorsPhone.length).toBeGreaterThan(0);
      const userPhoneErrorMessage =
        errorsPhone.find((e) => e.property === 'phone')?.constraints!
          .isPhoneNumber ?? undefined;
      expect(userPhoneErrorMessage).not.toBeUndefined();
      expect(userPhoneErrorMessage).toContain(
        `O telefone enviado deve ser um telefone válido`,
      );
    });

    it('Deve testar comportamento da data de nascimento do usuário via DTO', async () => {
      const dateBirthNotIsDate = 'this is not a date';
      const errorsDateBirth = await instanceAndValidateDto({
        dateBirth: dateBirthNotIsDate,
      });

      expect(errorsDateBirth.length).toBeGreaterThan(0);
      const userDateBirthErrorMessageNotValid =
        errorsDateBirth.find((e) => e.property === 'dateBirth')?.constraints!
          .isDate ?? undefined;
      const userDateBirthErrorMessageMaxDate =
        errorsDateBirth.find((e) => e.property === 'dateBirth')?.constraints!
          .maxDate ?? undefined;
      expect(userDateBirthErrorMessageNotValid).not.toBeUndefined();
      expect(userDateBirthErrorMessageNotValid).toContain(
        `A data de nascimento deve ser uma data válida`,
      );
      expect(userDateBirthErrorMessageMaxDate).not.toBeUndefined();
      expect(userDateBirthErrorMessageMaxDate).toContain(
        `A data de nascimento não pode estar no futuro`,
      );
    });

    it('Deve testar comportamento do nível de acesso do usuário via DTO', async () => {
      const role = 'BOSS';
      const errorsRole = await instanceAndValidateDto({
        role,
      });

      expect(errorsRole.length).toBeGreaterThan(0);
      const userRoleError =
        errorsRole.find((e) => e.property === 'role')?.constraints!.isIn ??
        undefined;
      expect(userRoleError).not.toBeUndefined();
      expect(userRoleError).toContain(
        `O nível de acesso deve ser 'ADMIN', 'MANAGER' ou 'USER'`,
      );
    });

    it('Deve testar comportamento a senha do usuário via DTO', async () => {
      const passwordString = 'pass';
      const passwordNumber = 123456;

      const errorsPasswordString = await instanceAndValidateDto({
        password: passwordString,
      });
      const errorsPasswordNumber = await instanceAndValidateDto({
        password: passwordNumber,
      });

      expect(errorsPasswordString.length).toBeGreaterThan(0);
      expect(errorsPasswordNumber.length).toBeGreaterThan(0);
      const userPasswordMinLengthError =
        errorsPasswordString.find((e) => e.property === 'password')
          ?.constraints!.minLength ?? undefined;
      const userPasswordMathesError =
        errorsPasswordString.find((e) => e.property === 'password')
          ?.constraints!.matches ?? undefined;
      const userPasswordNumberError =
        errorsPasswordNumber.find((e) => e.property === 'password')
          ?.constraints!.isString ?? undefined;

      expect(userPasswordMinLengthError).not.toBeUndefined();
      expect(userPasswordMathesError).not.toBeUndefined();
      expect(userPasswordNumberError).not.toBeUndefined();
      expect(userPasswordMinLengthError).toContain(
        `A senha deve ter pelo menos 6 caracteres`,
      );
      expect(userPasswordMathesError).toContain(
        `A senha deve conter pelo menos um número`,
      );
      expect(userPasswordNumberError).toContain(
        `A senha deve ser do tipo string`,
      );
    });
  });

  describe('Criação de usuários', () => {
    it('Deve lançar error quando service falhar ao criar usuário', async () => {
      const user = {
        dateBirth: new Date(),
        email: '',
        name: '',
        password: undefined,
        phone: '',
        role: 'USER',
      };
      jest
        .spyOn(userService, 'create')
        .mockResolvedValue(new Error('Erro ao criar usuário'));

      await expect(controller.create(user as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('Deve retornar usuário criado com sucesso', async () => {
      const mockUser = {
        email: 'mockUser@gmail.com',
        name: 'mock',
        dateBirth: new Date('2000-10-10'),
        phone: '48999999999',
        role: 'USER' as User['role'],
      };
      const instanceDto = plainToInstance(CreateUserDto, {
        ...mockUser,
        password: '123456',
      });
      const errors = await validate(instanceDto);
      jest.spyOn(userService, 'create').mockResolvedValue({
        ...mockUser,
        id: 1,
        active: 'S',
        password: undefined,
      } as any);

      const result = await controller.create({
        ...mockUser,
        password: '123456',
      });

      expect(errors.length).toBe(0);
      expect(result).toEqual({
        ...mockUser,
        id: 1,
        message: 'Usuário cadastrado com sucesso!',
        active: 'S',
      });
      expect(result.message).toBeDefined();
    });
  });

  describe('Exclusão de usuários', () => {
    it('Deve retornar exclusão de usuário com sucesso', async () => {
      jest.spyOn(userService, 'getById').mockResolvedValue({
        id: 1,
        email: 'test@gmail.com',
      } as any);

      const result = await controller.delete('1');
      expect(result.message).toBeDefined();
      expect(result.message).toContain('Usuário deletado com sucesso!');
    });

    it('Deve retornar exclusão de usuário com falha', async () => {
      jest.spyOn(userService, 'getById').mockResolvedValue({
        id: 1,
        email: 'test@gmail.com',
      } as any);

      await expect(
        controller.delete(null as unknown as string),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Atualização de usuários', () => {
    it('Deve retornar atualização de usuário com sucesso', async () => {
      const mockUserUpdate = {
        id: 1,
        email: 'test@gmail.com',
        dateBirth: new Date('2000-10-10'),
        name: 'test2',
        phone: null,
        role: 'MANAGER' as User['role'],
      };
      jest
        .spyOn(userService, 'getById')
        .mockResolvedValue(mockUserUpdate as any);
      jest.spyOn(userService, 'update').mockResolvedValue({
        ...mockUserUpdate,
        phone: '48999999999',
      } as any);

      const result = await controller.update('1', {
        ...mockUserUpdate,
        phone: '48999999999',
      });

      expect(result.message).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.message).toContain('Usuário atualizado com sucesso!');
      expect(result.user.phone).toBe('48999999999');
    });

    it('Deve retornar atualização de usuário com falha', async () => {
      const mockUserUpdate = {
        email: 'test@gmail.com',
        dateBirth: new Date('2000-10-10'),
        name: 'test2',
        phone: '48999999999',
        role: 'MANAGER' as User['role'],
      };

      await expect(
        controller.update(null as unknown as string, mockUserUpdate),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update(null as unknown as string, mockUserUpdate),
      ).rejects.toThrow(
        'Identificador do usuário a ser atualizado é obrigatório',
      );
    });
  });

  describe('Listagem de usuários', () => {
    it('Deve retornar a listagem de usuários com sucesso', async () => {
      const result = await controller.list(
        {
          page: 1,
          recordsPerPage: 5,
        },
        { id: 1 } as any,
      );

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.totalRecords).toBeGreaterThan(0);
      expect(result.totalPages).toBeDefined();
      expect(result.currentPage).toBeDefined();
      expect(result.recordsPerPage).toBeDefined();
    });

    it('Deve retornar a listagem de usuários com falha', async () => {
      await expect(
        controller.list(
          {
            page: 1,
            recordsPerPage: 5,
          },
          { id: null } as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
