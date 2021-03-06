import { inject, injectable } from 'tsyringe';
import { getDaysInMonth, getDate, getHours, isAfter } from 'date-fns';

import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';

interface Request {
    provider_id: string;
    day: number;
    month: number;
    year: number;
}

type Response = Array<{
    hour: number;
    available: boolean;
}>;

@injectable()
class ListDayAvailabilityService {
    constructor(
        @inject('AppointmentsRepository')
        private appointmentsRepository: IAppointmentsRepository
    ) {}
    
    public async execute({ provider_id, month, year, day }: Request) : Promise<Response>{
        const appointments = await this.appointmentsRepository.findAllInDayFromProvider({
            provider_id, 
            month, 
            year, 
            day
        });

        console.log(appointments);
        
        const hourStart = 8;
        const currentDate = new Date(Date.now());

        const eachHourArray = Array.from(
            { length: 10 }, 
            (_, index) => index + hourStart
        );

        const availability = eachHourArray.map(hour => {
            const hasAppointmentInHours = appointments.find(appointment => getHours(appointment.date) == hour);

            const compareDate = new Date(year, month-1, day, hour);

            return {
                hour,
                available: !hasAppointmentInHours && isAfter(compareDate, currentDate)
            }
        });

        return availability;
    }
}

export default ListDayAvailabilityService;