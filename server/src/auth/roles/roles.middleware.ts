import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';

@Injectable()
export class RolesMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: User = this.jwtService.verify(token);
      req['user'] = decoded;

      const requiredRoles = (this as any).requiredRoles as Role[];
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        throw new ForbiddenException('Permissão insuficiente');
      }

      next();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  static restrictTo(...roles: Role[]) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        this.requiredRoles = roles; // Define os roles necessários
        return originalMethod.apply(this, args);
      };
      return descriptor;
    };
  }
}
