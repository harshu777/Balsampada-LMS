import { PrismaService } from '../prisma/prisma.service';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';
import { Role } from '@prisma/client';
export declare class LiveSessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createLiveSessionDto: CreateLiveSessionDto, teacherId: string): Promise<{
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        teacher: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        startTime: Date;
        endTime: Date;
        meetingUrl: string | null;
        recordingUrl: string | null;
    }>;
    findAll(userId: string, userRole: Role): Promise<({
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        _count: {
            attendees: number;
        };
        teacher: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        startTime: Date;
        endTime: Date;
        meetingUrl: string | null;
        recordingUrl: string | null;
    })[]>;
    findOne(id: string): Promise<{
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        teacher: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        attendees: ({
            user: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            sessionId: string;
            joinedAt: Date;
            leftAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        startTime: Date;
        endTime: Date;
        meetingUrl: string | null;
        recordingUrl: string | null;
    }>;
    update(id: string, updateLiveSessionDto: UpdateLiveSessionDto, teacherId: string): Promise<{
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        teacher: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        startTime: Date;
        endTime: Date;
        meetingUrl: string | null;
        recordingUrl: string | null;
    }>;
    remove(id: string, teacherId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        startTime: Date;
        endTime: Date;
        meetingUrl: string | null;
        recordingUrl: string | null;
    }>;
    joinSession(sessionId: string, userId: string): Promise<{
        id: string;
        userId: string;
        sessionId: string;
        joinedAt: Date;
        leftAt: Date | null;
    }>;
    leaveSession(sessionId: string, userId: string): Promise<{
        id: string;
        userId: string;
        sessionId: string;
        joinedAt: Date;
        leftAt: Date | null;
    }>;
    getUpcomingSessions(userId: string, userRole: Role): Promise<({
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        teacher: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        startTime: Date;
        endTime: Date;
        meetingUrl: string | null;
        recordingUrl: string | null;
    })[]>;
}
