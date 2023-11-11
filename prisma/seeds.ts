import { Appointment, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
	console.log('Start seeding ...');
	await createAppointment('2023-12-08');
}

const createAppointment = async (date: string) => {
	const appointments: Appointment[] = [];

	for (let i = 1; i <= 18; i++) {
		const categoryId = i === 7 || i === 8 ? 6 : getRandomIntInclusive(1, 5);
		const catetegory = types.filter(type => type.key === categoryId)[0];
		const descLength = catetegory.description.length;
		if (i === 7 || i === 8) {
			const lunchBreak = await prisma.appointment.create({
				data: {
					description: catetegory.description[0],
					type: catetegory.value,
					date: new Date(date),
					timeId: i,
					categoryId,
					doctorId: 3,
					patientId: getRandomIntInclusive(5, 8),
				},
			});
			appointments.push(lunchBreak);
		} else {
			if (Math.random() > 0.5) {
				const appointment = await prisma.appointment.create({
					data: {
						description:
							catetegory.description[getRandomIntInclusive(0, descLength - 1)],
						type: catetegory.value,
						date: new Date(date),
						timeId: i,
						categoryId: categoryId,
						doctorId: 3,
						patientId: getRandomIntInclusive(5, 8),
					},
				});
				appointments.push(appointment);
			}
		}
	}
	console.log(`Created ${appointments.length} appointments`);
};

function getRandomIntInclusive(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
	//Максимум и минимум включаются
}

const types: { key: number; value: string; description: string[] }[] = [
	{
		key: 1,
		value: 'emergency',
		description: ['Stomach-ache', 'Heartache', 'Toothache', 'Broken arm'],
	},
	{
		key: 2,
		value: 'examination',
		description: ['Ultrasound', 'ECG', 'EEG', 'MRI', 'Screening'],
	},
	{
		key: 3,
		value: 'consultation',
		description: [
			'First visit',
			'Regular Consultation',
			'Paediatrician',
			'Family appointment',
			'Keeping pregnant',
		],
	},
	{
		key: 4,
		value: 'routine checkup',
		description: [
			'Routine Checkup',
			'Cardio Checkup',
			'Monthly Checkup',
			'Year Checkup',
		],
	},
	{
		key: 5,
		value: 'sick visit',
		description: [
			'Sprain',
			'Runny nose',
			'Gastrits',
			'Cold',
			'Fracture',
			'Concussion',
			'Hepatitis',
			'Dermatitis',
		],
	},
	{
		key: 6,
		value: 'break',
		description: ['lunch break'],
	},
];
main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
