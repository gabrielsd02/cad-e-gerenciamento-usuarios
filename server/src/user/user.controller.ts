import {
  Get,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Post,
  Delete,
  Param,
  NotFoundException,
  BadRequestException,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { PermissionsGuard } from 'src/casl/permissions.guard';
import { Action } from 'src/casl/caslAbility.factory';
import { JwtAuthGuard } from 'src/auth/jwtAuthGuard.guard';
import { CheckPolicies } from 'src/casl/casl.decorator';
import { User } from 'src/decorators/user-decorator';
import { User as UserType } from '@prisma/client';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPolicies([Action.Create, 'User'])
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPolicies([Action.Read, 'all'])
  @HttpCode(HttpStatus.OK)
  async list(@Query() filters: GetUsersDto, @User() user: UserType) {
    const authUserId = user.id;
    return await this.userService.getUsers({
      ...filters,
      authUserId,
    });
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPolicies([Action.Read, 'all'])
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    return await this.userService.getById(parseInt(id));
  }

  @Put('user/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPolicies([Action.Update, 'User'])
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    if (!id) {
      throw new BadRequestException(
        'Identificador do usuário a ser atualizado é obrigatório',
      );
    }

    const userToUpdate = await this.userService.getById(parseInt(id));
    if (!userToUpdate) {
      throw new BadRequestException('Usuário não encontrado');
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPolicies([Action.Delete, 'User'])
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException(
        'Identificador do usuário a ser deletado é obrigatório',
      );
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
