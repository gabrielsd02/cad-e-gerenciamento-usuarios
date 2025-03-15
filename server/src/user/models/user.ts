import { User as PrismaUser } from '@prisma/client';

export class User {
  public id: number;
  public name: string;
  public email: string;
  public role: PrismaUser['role'];
  public phone: string | null;
  public dateBirth: Date | null;
  constructor(user: PrismaUser) {
    Object.assign(this, user);
  }
}
