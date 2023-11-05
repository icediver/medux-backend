import { applyDecorators, UseGuards } from '@nestjs/common';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { TypeRole } from '../types/auth.interface';
import { OnlyDoctorGuard } from '../guards/doctor.guard';

export const Auth = (role: TypeRole = 'PATIENT') =>
	applyDecorators(
		role === 'ADMIN'
			? UseGuards(JwtAuthGuard, OnlyAdminGuard)
			: role === 'DOCTOR'
			? UseGuards(JwtAuthGuard, OnlyDoctorGuard)
			: UseGuards(JwtAuthGuard),
	);
