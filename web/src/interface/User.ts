type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface UserType {
	id: string | null;
  name: string;
  email: string;
	dateBirth: Date | null;
	phone: string | null;
	role: UserRole;
	registrationDate: Date | string;
}