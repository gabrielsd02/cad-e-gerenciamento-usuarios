import { IsString, IsNotEmpty } from 'class-validator';

export class HeaderDto {
  @IsString({ message: 'O header Authorization deve ser uma string' })
  @IsNotEmpty({ message: 'O header Authorization é obrigatório' })
  authorization: string;
}
