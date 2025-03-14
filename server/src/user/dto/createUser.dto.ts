import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxDate,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser do tipo string' })
  @MinLength(4, { message: 'O nome deve ter pelo menos 4 caracteres' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, {
    message: 'O nome deve conter apenas letras',
  })
  name: string;

  @IsEmail(
    {},
    { message: 'O email enviado deve ser um endereço de email válido' },
  )
  email: string;

  @IsOptional()
  @IsPhoneNumber('BR', {
    message: 'O telefone enviado deve ser um telefone válido',
  })
  phone: string;

  @IsOptional()
  @IsDate({ message: 'A data de nascimento deve ser uma data válida' })
  @MaxDate(new Date(), {
    message: 'A data de nascimento não pode estar no futuro',
  })
  @Type(() => Date)
  dateBirth: Date;

  @IsIn(['ADMIN', 'MANAGER', 'USER'], {
    message: "O nível de acesso deve ser 'ADMIN', 'MANAGER' ou 'USER'",
  })
  role: Role;

  @IsString({ message: 'A senha deve ser do tipo string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @Matches(/[0-9]/, { message: 'A senha deve conter pelo menos um número' })
  password: string;
}
