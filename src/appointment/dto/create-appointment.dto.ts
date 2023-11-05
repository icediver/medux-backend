import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

const appointmentType = [
	'examination',
	'lunchBreak',
	'emergency',
	'consultation',
	'routineCheckup',
	'sickVisit',
];

export class CreateAppointmentDto {
	@IsOptional()
	@IsString()
	description: string;

	@IsString()
	type: string;

	@IsString()
	date: string;

	@IsNumber()
	timeId: number;

	@IsNumber()
	categoryId: number;

	@IsNumber()
	userId: number;
}
