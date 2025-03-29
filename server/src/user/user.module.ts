import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { CaslAbilityFactory } from '../casl/caslAbility.factory';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), JwtModule],
  providers: [UserService, CaslAbilityFactory],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
