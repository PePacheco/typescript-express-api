import { inject, injectable } from 'tsyringe';
import { getDaysInMonth, getDate } from 'date-fns';

import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';

interface Request {
    provider_id: string;
    month: number;
    year: number;
}

type Response = Array<{
    day: number;
    available: boolean;
}>;

@injectable()
class ListMonthAvailabilityService {
    constructor(
        @inject('AppointmentsRepository')
        private appointmentsRepository: IAppointmentsRepository
    ) {}
    
    public async execute({ provider_id, month, year }: Request) : Promise<Response>{
        const appointments = await this.appointmentsRepository.findAllInMonthFromProvider({
            provider_id,
            month,
            year
        })

        const numberOfDaysInMonth = getDaysInMonth(new Date(year, month - 1));

        const eachDayArray = Array.from(
            { length: numberOfDaysInMonth },
            (_, index) => index + 1
        );

        const availability = eachDayArray.map( day => {
            const appointmentsInDay = appointments.filter(appointment => {
                return getDate(appointment.date) == day
            });

            return { day, available: appointmentsInDay.length < 10 };
        });

        return availability;
    }
}

export default ListMonthAvailabilityService;