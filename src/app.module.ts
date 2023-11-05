import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PaginationModule } from './pagination/pagination.module';
import { MediaModule } from './media/media.module';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
	imports: [AuthModule, UserModule, PaginationModule, MediaModule, AppointmentModule],
	controllers: [AppController],
	providers: [AppService, PrismaService],
})
export class AppModule {}
