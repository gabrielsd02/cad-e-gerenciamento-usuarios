import { Injectable } from '@nestjs/common';
import {
  createMongoAbility,
  AbilityBuilder,
  InferSubjects,
  MongoQuery,
} from '@casl/ability';
import { User } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<User | 'all'>;
export type PossibleAbilities = [Action, Subjects];
export type Conditions = MongoQuery;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.role === 'ADMIN') {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
      cannot(Action.Delete, 'User').because(
        'Você não possui permissão para deletar usuários.',
      );

      if (user.role === 'MANAGER') {
        can(Action.Update, 'User', { role: { $ne: 'ADMIN' } });
        cannot(Action.Update, 'User', ['role']);
      } else {
        can(Action.Update, 'User', { id: user.id });
        cannot(Action.Update, 'User', ['role']);
      }
    }

    return build({
      detectSubjectType: (item) =>
        item !== null && 'role' in item ? 'User' : item.constructor.name,
    });
  }
}
