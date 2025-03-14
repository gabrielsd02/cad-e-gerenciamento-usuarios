import {
  Get,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Headers,
  UnauthorizedException,
  Post,
  Delete,
  Param,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { HeaderDto } from 'src/dto/headerDto';
import { CreateUserDto } from './dto/createUser.dto';
import { GetUsersDto } from './dto/getUsers.dto';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('user')
  @HttpCode(HttpStatus.OK)
  async create(@Body() createDto: CreateUserDto) {
    const user = await this.userService.create({
      ...createDto,
    });
    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
      dateBirth: user.dateBirth,
      phone: user.phone,
      role: user.role,
    };
    return {
      message: 'Usuário cadastrado com sucesso!',
      ...payload,
    };
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async list(@Query() filters: GetUsersDto, @Headers() headers: HeaderDto) {
    const token = headers?.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token não enviado');
    }

    const userToken = await this.userService.getUserFromToken(token);
    if (!userToken) {
      throw new UnauthorizedException('Usuário não possui permissão');
    }

    const authUserId = userToken.id;
    return await this.userService.getUsers({
      ...filters,
      authUserId,
    });
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string, @Headers() headers: HeaderDto) {
    const token = headers?.authorization?.split(' ')[1];
    console.log(id, token);
    if (!token) {
      throw new UnauthorizedException('Token não enviado');
    }

    const userToken = await this.userService.getUserFromToken(token);
    if (!userToken) {
      throw new UnauthorizedException('Usuário não possui permissão');
    }

    return await this.userService.getById(parseInt(id));
  }

  @Put('user/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @Headers() headers: HeaderDto,
  ) {
    if (!id) {
      throw new BadRequestException(
        'Identificador do usuário a ser deletado é obrigatório',
      );
    }

    const token = headers?.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token não enviado');
    }

    const userToken = await this.userService.getUserFromToken(token);
    if (!userToken) {
      throw new UnauthorizedException('Usuário não possui permissão');
    }
    const userUpdated = await this.userService.update({
      id: parseInt(id),
      ...updateDto,
    });
    return {
      message: 'Usuário atualizado com sucesso!',
      user: userUpdated,
    };
  }

  @Delete('user/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Headers() headers: HeaderDto) {
    if (!id) {
      throw new BadRequestException(
        'Identificador do usuário a ser deletado é obrigatório',
      );
    }

    const token = headers?.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token não enviado');
    }

    const userToken = await this.userService.getUserFromToken(token);
    if (!userToken) {
      throw new UnauthorizedException('Você não possui permissão para isso');
    }

    const userWillDelete = await this.userService.getById(parseInt(id));
    if (!userWillDelete) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const userIdtoDelete = parseInt(id);
    await this.userService.delete(userIdtoDelete);
    return {
      message: 'Usuário deletado com sucesso!',
    };
  }
}
