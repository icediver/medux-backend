import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { EnumUserSort } from '../types/enums';

export class GetAllUserDto extends PaginationDto {
	@IsOptional()
	@IsEnum(EnumUserSort)
	sort?: EnumUserSort;

	@IsOptional()
	@IsString()
	searchTerm?: string;

	@IsOptional()
	@IsString()
	role?: string;

	@IsOptional()
	@IsString()
	letter?: string;
}
