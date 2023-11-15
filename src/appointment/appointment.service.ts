import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PrismaService } from 'src/prisma.service';
import { Appointment, Prisma, Role } from '@prisma/client';
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
				date: new Date(date),
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
			orderBy: [{ date: 'asc' }, { timeId: 'asc' }],
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
			const gte = start ? { gte: new Date(start) } : {};
			const lte = end ? { lte: new Date(end) } : {};
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

	async getNextAppointment(id: number) {
		const start = new Date(new Date().toLocaleDateString('sv-SE'));
		const end = new Date(new Date().setMonth(new Date().getMonth() + 1));
		const currentTime = new Date().toLocaleTimeString('sv').slice(0, 5);
		const filters: Prisma.AppointmentWhereInput = {
			doctorId: id,
			date: {
				gte: start,
				lte: end,
			},
			// time: { time: { gt: currentTime } },
		};
		const appointments = await this.prisma.appointment.findMany({
			where: filters,

			select: returnAppointmentObj,
			orderBy: [{ date: 'asc' }, { timeId: 'asc' }],
		});
		const dates = [
			...new Set(appointments.map(app => app.date.toLocaleDateString('sv-SE'))),
		];
		const groupByDates = dates.map(date => {
			return {
				date,
				appointments: appointments.filter(
					app => app.date.toLocaleDateString('sv-SE') == date,
				),
			};
		});
		const isToday = currentTime < '17:30';

		if (isToday) {
			return groupByDates[0].appointments.filter(
				app => app.time.time > currentTime,
			)[0];
		} else {
			return groupByDates[1].appointments[0];
		}

		// return groupByDates[0].appointments[0];
		return isToday;
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

type AppointmentWithTime = Prisma.AppointmentGetPayload<{
	include: { time: true };
}>;
export function getNext(appointments: AppointmentWithTime[]) {
	const currentDate = new Date(2023, 10, 11, 9, 30);
	console.log(currentDate);
	appointments.map(app => console.log(new Date(app.date)));
	const appointmentNext = appointments.find(app => {
		const date = new Date(app.date);
		date.setHours(+app.time.time.split(':')[0]);
		date.setMinutes(+app.time.time.split(':')[1]);
		return date > currentDate;
	});
	return appointmentNext;
}
