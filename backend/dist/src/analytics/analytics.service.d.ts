import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(userId: string, userRole: string): Promise<any>;
    getStudentPerformance(studentId: string, subjectId?: string): Promise<{
        assignments: {
            total: number;
            submitted: number;
            graded: number;
            pending: number;
            averageMarks: number;
            submissionRate: number;
        };
        tests: {
            total: number;
            completed: number;
            passed: number;
            averageMarks: number;
            passRate: number;
        };
        attendance: {
            total: number;
            present: number;
            absent: number;
            late: number;
            excused: number;
            attendanceRate: number;
        };
        recentAssignments: ({
            assignment: {
                subject: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    isActive: boolean;
                    classId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                dueDate: Date;
                subjectId: string;
                isActive: boolean;
                teacherId: string;
                instructions: string | null;
                attachmentUrl: string | null;
                totalMarks: number | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            assignmentId: string;
            submissionText: string | null;
            submissionUrl: string | null;
            marksObtained: number | null;
            feedback: string | null;
            submittedAt: Date | null;
            gradedAt: Date | null;
        })[];
        recentTests: ({
            test: {
                subject: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    isActive: boolean;
                    classId: string;
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
                totalMarks: number;
                questions: import("@prisma/client/runtime/library").JsonValue;
                duration: number;
                startTime: Date;
                endTime: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            marksObtained: number | null;
            feedback: string | null;
            submittedAt: Date | null;
            testId: string;
            answers: import("@prisma/client/runtime/library").JsonValue;
            startedAt: Date;
            attemptedAt: Date;
            isPassed: boolean;
            isCompleted: boolean;
        })[];
    }>;
    getClassPerformance(classId: string): Promise<{
        subjectId: string;
        subjectName: string;
        totalStudents: number;
        totalAssignments: number;
        totalTests: number;
        assignmentCompletionRate: number;
        testCompletionRate: number;
        averageMarks: number;
    }[]>;
    getRevenueAnalytics(startDate?: Date, endDate?: Date): Promise<{
        totalRevenue: number;
        revenueByType: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PaymentGroupByOutputType, "type"[]> & {
            _count: number;
            _sum: {
                amount: number | null;
            };
        })[];
        revenueByMethod: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PaymentGroupByOutputType, any[]> & {
            _count: number;
            _sum: {
                amount: number | null;
            };
        })[];
        monthlyRevenue: {
            month: string;
            revenue: number;
        }[];
        pendingAmount: number;
        pendingCount: number;
    }>;
    getAttendanceAnalytics(subjectId?: string, startDate?: Date, endDate?: Date): Promise<{
        overall: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.AttendanceGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        bySubject: {
            subjectName: string;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            count: number;
        }[];
        attendanceRate: number;
        totalRecords: number;
    }>;
    private calculateAssignmentStats;
    private calculateTestStats;
    private calculateAttendanceStats;
    getTeacherAnalytics(teacherId: string): Promise<{
        subjectId: string;
        subjectName: string;
        totalStudents: number;
        totalAssignments: number;
        totalTests: number;
        totalMaterials: number;
        assignments: {
            title: string;
            totalMarks: number | null;
            submissions: number;
            graded: number;
            averageMarks: number;
            submissionRate: number;
        }[];
        tests: {
            title: string;
            totalMarks: number;
            attempts: number;
            passed: number;
            averageMarks: number;
            passRate: number;
        }[];
    }[]>;
}
