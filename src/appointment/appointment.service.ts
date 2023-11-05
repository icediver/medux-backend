import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { returnUserObject } from 'src/user/dto/return-user.object';

@Injectable()
export class AppointmentService {
	constructor(private prisma: PrismaService) {}
	create(createAppointmentDto: CreateAppointmentDto, role: Role, id: number) {
		const { type, timeId, userId, description, categoryId, date } =
			createAppointmentDto;
		const newAppointments = this.prisma.appointment.create({
			data: {
				type,
				description,
				doctorId: role === 'DOCTOR' ? id : userId,
				patientId: role === 'PATIENT' ? id : userId,
				categoryId,
				timeId,
				date,
			},
		});
		return newAppointments;
	}

	findAll(id: number) {
		const appointmentsSearchTerm: Prisma.AppointmentWhereInput = {
			OR: [
				{
					patientId: id,
				},
				{
					doctorId: id,
				},
			],
		};

		const appointments = this.prisma.appointment.findMany({
			where: appointmentsSearchTerm,
			select: returnAppointmentObj,
		});
		return appointments;
	}

	async findOne(id: number) {
		const appointment = await this.prisma.appointment.findUnique({
			where: { id },
			select: returnAppointmentObj,
		});
		return appointment;
	}

	async update(
		id: number,
		updateAppointmentDto: UpdateAppointmentDto,
		currentUserId: number,
	) {
		const { userId, ...dto } = updateAppointmentDto;
		const appointmentsSearchTerm: Prisma.AppointmentWhereInput = {
			AND: [
				{ id },
				{
					OR: [
						{
							patientId: currentUserId,
						},
						{
							doctorId: currentUserId,
						},
					],
				},
			],
		};

		const appointments = await this.prisma.appointment.findMany({
			where: appointmentsSearchTerm,
		});
		if (!appointments.length)
			throw new NotFoundException('Appointment not found');

		return this.prisma.appointment.update({
			where: { id },
			data: { ...dto },
			select: returnAppointmentObj,
		});
	}

	remove(id: number) {
		return this.prisma.appointment.delete({ where: { id } });
	}
}

const returnAppointmentObj: Prisma.AppointmentSelect = {
	time: true,
	doctor: { select: returnUserObject },
	patient: { select: returnUserObject },
	type: true,
	description: true,
	category: { select: { id: true, name: true } },
	date: true,
};
