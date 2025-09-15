export declare class CreateTimetableDto {
    subjectId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomNumber?: string;
    isRecurring?: boolean;
    startDate?: Date;
    endDate?: Date;
}
declare const UpdateTimetableDto_base: import("@nestjs/common").Type<Partial<CreateTimetableDto>>;
export declare class UpdateTimetableDto extends UpdateTimetableDto_base {
}
export {};
