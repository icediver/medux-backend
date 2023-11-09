import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UsePipes,
	ValidationPipe,
	Query,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role } from '@prisma/client';
import { FindAllAppointmentsDto } from './dto/find-all.appointments.dto';

@Controller('appointments')
export class AppointmentController {
	constructor(private readonly appointmentService: AppointmentService) {}

	//--------------------Create------------------------//

	@Auth()
	@UsePipes(new ValidationPipe())
	@Post()
	create(
		@Body() createAppointmentDto: CreateAppointmentDto,
		@CurrentUser('role') role: Role,
		@CurrentUser('id') id: number,
	) {
		return this.appointmentService.create(createAppointmentDto, role, id);
	}

	//--------------------Read--------------------------//
	@UsePipes(new ValidationPipe())
	@Auth()
	@Get()
	findAll(
		@CurrentUser('id') id: number,
		@Query() queryDto: FindAllAppointmentsDto,
	) {
		return this.appointmentService.findAll(id, queryDto);
	}
	@Auth()
	@Get(':id')
	findById(@Param('id') id: string) {
		return this.appointmentService.findById(+id);
	}
	@Auth()
	@Get('date/:date')
	findByDate(@Param('date') date: string) {
		return this.appointmentService.findByDate(date);
	}

	//--------------------Update-----------------------//

	@Auth()
	@UsePipes(new ValidationPipe())
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateAppointmentDto: UpdateAppointmentDto,
		@CurrentUser('id') currentUserId: number,
	) {
		return this.appointmentService.update(
			+id,
			updateAppointmentDto,
			currentUserId,
		);
	}

	//--------------------Delete-----------------------//

	@Auth()
	@Delete(':id')
	remove(@Param('id') id: string, @CurrentUser('id') currentUserId: number) {
		return this.appointmentService.remove(+id);
	}
}
