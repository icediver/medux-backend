import { IsDate, IsDateString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/pagination/pagination.dto';

export class FindAllAppointmentsDto extends PaginationDto {
	@IsOptional()
	@IsDateString()
	start?: string;

	@IsOptional()
	@IsDateString()
	end?: string;
}
