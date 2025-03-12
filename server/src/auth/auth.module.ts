import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
// import { RolesMiddleware } from './roles/roles.middleware';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: 'a-secret-key',
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule],
})

export class AuthModule {}
// export class AuthModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(RolesMiddleware).forRoutes(AuthController);
//   }
// }
