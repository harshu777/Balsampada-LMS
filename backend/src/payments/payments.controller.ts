import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseUUIDPipe,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  ApprovePaymentDto,
  RejectPaymentDto,
  PaymentFilterDto,
} from './dto';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('proofFile'))
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFile() proofFile: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.paymentsService.createPayment(
      createPaymentDto,
      req.user.id,
      proofFile,
    );
  }

  @Get()
  async getPayments(@Query() filters: PaymentFilterDto, @Req() req: any) {
    return this.paymentsService.getPayments(filters, req.user.role, req.user.id);
  }

  @Get('statistics')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getPaymentStatistics(@Query() filters: { academicYear?: string; monthYear?: string }) {
    return this.paymentsService.getPaymentStatistics(filters);
  }

  @Get('overdue')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getOverduePayments() {
    return this.paymentsService.getOverduePayments();
  }

  @Get(':id')
  async getPaymentById(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.paymentsService.getPaymentById(id, req.user.role, req.user.id);
  }

  @Get(':id/proof')
  async getPaymentProof(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const payment = await this.paymentsService.getPaymentById(id, req.user.role, req.user.id);
    
    if (!payment.proofFileUrl) {
      throw new BadRequestException('No proof file found for this payment');
    }

    const filePath = path.join(process.cwd(), payment.proofFileUrl);
    
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Proof file not found on server');
    }

    res.sendFile(filePath);
  }

  @Put(':id')
  async updatePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.updatePayment(id, updatePaymentDto);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async approvePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approvePaymentDto: ApprovePaymentDto,
    @Req() req: any,
  ) {
    return this.paymentsService.approvePayment(id, approvePaymentDto, req.user.id);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async rejectPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectPaymentDto: RejectPaymentDto,
    @Req() req: any,
  ) {
    return this.paymentsService.rejectPayment(id, rejectPaymentDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deletePayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.deletePayment(id);
  }

  // Student-specific endpoints
  @Post('student/monthly')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('proofFile'))
  async createMonthlyPayment(
    @Body() createPaymentDto: Omit<CreatePaymentDto, 'studentId' | 'type'>,
    @UploadedFile() proofFile: Express.Multer.File,
    @Req() req: any,
  ) {
    const paymentData = {
      ...createPaymentDto,
      studentId: req.user.id,
      type: 'MONTHLY_FEE' as const,
    };

    return this.paymentsService.createPayment(paymentData, req.user.id, proofFile);
  }

  @Get('student/history')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  async getStudentPaymentHistory(@Query() filters: PaymentFilterDto, @Req() req: any) {
    const studentFilters = {
      ...filters,
      studentId: req.user.id,
    };
    return this.paymentsService.getPayments(studentFilters, req.user.role, req.user.id);
  }

  // Admin-specific endpoints
  @Get('admin/pending')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getPendingPayments(@Query() filters: PaymentFilterDto) {
    const pendingFilters = {
      ...filters,
      status: 'PENDING' as const,
    };
    return this.paymentsService.getPayments(pendingFilters, Role.ADMIN);
  }

  @Post('admin/bulk-approve')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async bulkApprovePayments(
    @Body() { paymentIds, notes }: { paymentIds: string[]; notes?: string },
    @Req() req: any,
  ) {
    const results = await Promise.allSettled(
      paymentIds.map(id => 
        this.paymentsService.approvePayment(id, { notes }, req.user.id)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      message: `Bulk approval completed: ${successful} successful, ${failed} failed`,
      results,
    };
  }

  @Post('admin/bulk-reject')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async bulkRejectPayments(
    @Body() { paymentIds, rejectionReason, notes }: { 
      paymentIds: string[]; 
      rejectionReason: string; 
      notes?: string 
    },
    @Req() req: any,
  ) {
    const results = await Promise.allSettled(
      paymentIds.map(id => 
        this.paymentsService.rejectPayment(id, { rejectionReason, notes }, req.user.id)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      message: `Bulk rejection completed: ${successful} successful, ${failed} failed`,
      results,
    };
  }

  // Generate receipt PDF (placeholder for future implementation)
  @Get(':id/receipt')
  async generateReceipt(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const payment = await this.paymentsService.getPaymentById(id, req.user.role, req.user.id);
    
    if (payment.status !== 'APPROVED') {
      throw new BadRequestException('Receipt can only be generated for approved payments');
    }

    // TODO: Implement PDF generation logic here
    return {
      message: 'Receipt generation functionality to be implemented',
      payment: {
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        approvalDate: payment.approvalDate,
      },
    };
  }
}