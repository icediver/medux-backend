import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { returnUserObject } from './dto/return-user.object';
import { Prisma, Role } from '@prisma/client';
import { UserDto } from './dto/user.dto';
import { hash } from 'argon2';
import { GetAllUserDto } from './dto/get-all-users.dto';
import { EnumUserSort } from './types/enums';
import { PaginationService } from 'src/pagination/pagination.service';

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private paginationService: PaginationService,
	) {}
	async byId(id: number, selectObject: Prisma.UserSelect = {}) {
		const user = await this.prisma.user.findUnique({
			where: {
				id,
			},
			select: {
				...returnUserObject,
				...selectObject,
			},
		});

		if (!user) {
			throw new Error('User not found');
		}

		return user;
	}

	async updateProfile(id: number, dto: UserDto) {
		const isSameUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (isSameUser && id !== isSameUser.id)
			throw new BadRequestException('Email already in use');

		const user = await this.byId(id);

		return this.prisma.user.update({
			where: {
				id,
			},
			data: {
				email: dto.email,
				name: dto.name,
				avatarPath: dto.avatarPath,
				phone: dto.phone,
				password: dto.password ? await hash(dto.password) : user.password,
			},
			select: {
				...returnUserObject,
			},
		});
	}
	async getAll(dto: GetAllUserDto) {
		const { sort, searchTerm, role } = dto || {};

		const prismaFilters: Prisma.UserWhereInput[] = [];
		//-----filters-----
		if (role)
			prismaFilters.push({
				role: role as Role,
			});

		const prismaSort: Prisma.UserOrderByWithRelationInput[] = [];
		if (sort === EnumUserSort.OLDEST) {
			prismaSort.push({ createdAt: 'asc' });
		} else {
			prismaSort.push({ createdAt: 'desc' });
		}

		const prismaSearchTermFilter: Prisma.UserWhereInput = searchTerm
			? {
					OR: [
						{
							name: {
								contains: searchTerm,
								mode: 'insensitive',
							},
						},
						// {
						// 	email: {
						// 		contains: searchTerm,
						// 		mode: 'insensitive',
						// 	},
						// },
					],
			  }
			: {};

		const { perPage, skip } = this.paginationService.getPagination(dto);

		const users = await this.prisma.user.findMany({
			where: {
				AND: [...prismaFilters, prismaSearchTermFilter],
			},
			orderBy: prismaSort,
			skip,
			take: perPage,
			select: { ...returnUserObject },
		});

		return {
			users,
			length: await this.prisma.user.count({
				where: {
					AND: [...prismaFilters, prismaSearchTermFilter],
				},
			}),
		};
	}
}
