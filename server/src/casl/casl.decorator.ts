import { SetMetadata } from '@nestjs/common';
import { Action } from './caslAbility.factory';

export const CheckPolicies = (...policies: [Action, any][]) => {
  return SetMetadata('casl', policies);
};
