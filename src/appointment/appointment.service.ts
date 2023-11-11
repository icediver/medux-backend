import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { returnUserObject } from 'src/user/dto/return-user.object';
import { FindAllAppointmentsDto } from './dto/find-all.appointments.dto';

@Injectable()
export class AppointmentService {
	constructor(private prisma: PrismaService) {}

	//--------------------Create------------------------//

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

	//--------------------Read--------------------------//

	async findAll(id: number, dto: FindAllAppointmentsDto = {}) {
		const filters = this.createFilters(id, dto);

		const appointments = await this.prisma.appointment.findMany({
			where: filters,
			select: returnAppointmentObj,
		});

		const dates = this.datesArray(new Date(dto.start), new Date(dto.end));
		const groupByDates = dates.map(date => ({
			date: date.toLocaleDateString('sv-SE'),
			appointments: appointments.filter(
				app => app.date.getTime() == date.getTime(),
			),
		}));
		return groupByDates;
	}

	private createFilters(id: number, dto: FindAllAppointmentsDto) {
		const filters: Prisma.AppointmentWhereInput[] = [];
		const appointmentsSearchById: Prisma.AppointmentWhereInput = {
			OR: [
				{
					patientId: id,
				},
				{
					doctorId: id,
				},
			],
		};

		if (appointmentsSearchById) filters.push(appointmentsSearchById);

		if (dto) {
			const { start, end } = dto;
			filters.push({
				date: {
					gte: new Date(start), // Start of date range
					lte: new Date(end),
				},
			});
		}
		return filters.length ? { AND: filters } : {};
	}

	private datesArray(start: Date, end: Date): Date[] {
		let result = [],
			current = new Date(start);
		while (current <= end)
			result.push(current) &&
				(current = new Date(current)) &&
				current.setDate(current.getDate() + 1);
		return result;
	}

	async findById(id: number) {
		const appointment = await this.prisma.appointment.findUnique({
			where: { id },
			select: returnAppointmentObj,
		});
		return appointment;
	}

	async findByDate(date: string) {
		const appointment = await this.prisma.appointment.findMany({
			where: { date: { equals: new Date(date) } },
			select: returnAppointmentObj,
		});
		return appointment;
	}

	//--------------------Update-----------------------//

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

	//--------------------Delete-----------------------//

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
