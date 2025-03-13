import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'O nome deve ser do tipo string' })
  @MinLength(4, { message: 'O nome deve ter pelo menos 4 caracteres' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, {
    message: 'O nome deve conter apenas letras',
  })
  name: string;

  @IsEmail({}, { message: 'O email deve ser um endereço de email válido' })
  email: string;

  @IsString({ message: 'A senha deve ser do tipo string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @Matches(/[0-9]/, { message: 'A senha deve conter pelo menos um número' })
  password: string;

  @IsString({ message: 'A confirmação da senha deve ser do tipo string' })
  @MinLength(6, {
    message: 'A confirmação da senha deve ter pelo menos 6 caracteres',
  })
  @Matches(/[0-9]/, {
    message: 'A confirmação da senha deve conter pelo menos um número',
  })
  confirmPassword: string;
}
