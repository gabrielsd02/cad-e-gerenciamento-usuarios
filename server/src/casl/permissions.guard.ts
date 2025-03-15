import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, Action } from './caslAbility.factory';
import { ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private abilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const actions = this.reflector.get<[Action, any][]>('casl', handler) || [];

    const request = context
      .switchToHttp()
      .getRequest<
        Request & { user?: User; params?: { id: string }; body: any }
      >();

    const verifyIfUserHasPermission = (
      actions: [Action, any][],
      targetUser: User,
    ) => {
      for (const [action] of actions) {
        if (!ability.can(action, targetUser)) {
          throw new ForbiddenException(`Acesso negado para esta ação`);
        }
      }
    };

    const user = request.user;
    const resourceId = request.params?.id;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    const ability = this.abilityFactory.createForUser(user);
    const updateData = request.body as object | null;

    if (!resourceId) {
      verifyIfUserHasPermission(actions, user);
      return true;
    }

    const targetUser = await this.userService.getById(parseInt(resourceId));
    if (targetUser) {
      if (updateData) {
        const updateKeys = Object.keys(updateData);

        const rules = ability.rules
          .map((rule) => rule.fields)
          .filter((rule) => !!rule)
          .flat();

        if (updateKeys.some((key) => rules.includes(key))) {
          throw new ForbiddenException('Você não possui permissão.');
        }
      }
      verifyIfUserHasPermission(actions, targetUser);
    }

    return true;
  }
}
