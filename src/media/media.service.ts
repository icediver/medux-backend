import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { IMediaResponse } from './media.interface';
import { ensureDir, writeFile } from 'fs-extra';
@Injectable()
export class MediaService {
	async saveMedia(
		mediaFile: Express.Multer.File,
		folder = 'media',
		userId: number,
	): Promise<IMediaResponse> {
		// if (mediaFile.mimetype.indexOf('image') < 0)
		//   throw new HttpException('File must be image', HttpStatus.FORBIDDEN);
		//
		// if (mediaFile.size > 1000000)
		//   throw new HttpException('File is too big', HttpStatus.FORBIDDEN);
		const uploadFolder = `${path}/uploads/${folder}/${userId}`;

		await ensureDir(uploadFolder);

		await writeFile(
			`${uploadFolder}/${mediaFile.originalname}`,
			mediaFile.buffer,
		);

		return {
			url: `/uploads/${folder}/${userId}/${mediaFile.originalname}`,
			name: mediaFile.originalname,
		};
	}
}
