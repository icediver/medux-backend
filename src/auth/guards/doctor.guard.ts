import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class OnlyDoctorGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: User }>();
		const user = request.user;
		const isDoctor = user.role === 'DOCTOR' || user.role === 'ADMIN';

		if (!isDoctor) throw new ForbiddenException(`You don"t have rights!`);
		return isDoctor;
	}
}
