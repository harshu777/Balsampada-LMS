import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(createMaterialDto: CreateMaterialDto, file: Express.Multer.File, userId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacherSubjects: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can upload materials');
    }

    const isTeachingSubject = teacher.teacherSubjects.some(
      ts => ts.subjectId === createMaterialDto.subjectId
    );

    if (!isTeachingSubject) {
      throw new ForbiddenException('You can only upload materials for subjects you teach');
    }

    return this.prisma.material.create({
      data: {
        title: createMaterialDto.title,
        description: createMaterialDto.description,
        subjectId: createMaterialDto.subjectId,
        uploadedById: userId,
        fileUrl: `/uploads/materials/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      },
      include: {
        subject: {
          include: {
            class: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(subjectId?: string, userId?: string, userRole?: string) {
    const where: any = {};

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (userRole === 'STUDENT') {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          studentId: userId,
          isActive: true,
        },
        select: { subjectId: true },
      });

      const enrolledSubjectIds = enrollments.map(e => e.subjectId);
      where.subjectId = { in: enrolledSubjectIds };
    } else if (userRole === 'TEACHER') {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: {
          teacherId: userId,
          isActive: true,
        },
        select: { subjectId: true },
      });

      const teachingSubjectIds = teacherSubjects.map(ts => ts.subjectId);
      where.subjectId = { in: teachingSubjectIds };
    }

    return this.prisma.material.findMany({
      where,
      include: {
        subject: {
          include: {
            class: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            class: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (userRole === 'STUDENT') {
      const enrollment = await this.prisma.studentEnrollment.findFirst({
        where: {
          studentId: userId,
          subjectId: material.subjectId,
          isActive: true,
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this subject');
      }
    } else if (userRole === 'TEACHER' && material.uploadedById !== userId) {
      const teacherSubject = await this.prisma.teacherSubject.findFirst({
        where: {
          teacherId: userId,
          subjectId: material.subjectId,
          isActive: true,
        },
      });

      if (!teacherSubject) {
        throw new ForbiddenException('You do not have access to this material');
      }
    }

    await this.prisma.material.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    return material;
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto, userId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.uploadedById !== userId) {
      throw new ForbiddenException('You can only update your own materials');
    }

    return this.prisma.material.update({
      where: { id },
      data: updateMaterialDto,
      include: {
        subject: {
          include: {
            class: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (userRole !== 'ADMIN' && material.uploadedById !== userId) {
      throw new ForbiddenException('You can only delete your own materials');
    }

    if (material.fileUrl) {
      try {
        const filePath = join(process.cwd(), material.fileUrl);
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    return this.prisma.material.delete({
      where: { id },
    });
  }
}