import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: User }>();
		const user = request.user;
		const isAdmin = user.role === 'ADMIN';

		if (!isAdmin) throw new ForbiddenException('You don"t have rights!');
		return isAdmin;
	}
}
