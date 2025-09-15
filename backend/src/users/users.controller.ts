import { 
  Controller, 
  Get, 
  Put, 
  Delete, 
  Param, 
  Query, 
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, UserStatus } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('students')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getStudents(@Query('status') status?: UserStatus) {
    return this.usersService.getStudents(status);
  }

  @Get('teachers')
  @Roles(Role.ADMIN)
  async getTeachers(@Query('status') status?: UserStatus) {
    return this.usersService.getTeachers(status);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id/status')
  @Roles(Role.ADMIN)
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
    @Body('remarks') remarks?: string,
  ) {
    return this.usersService.updateUserStatus(id, status, remarks);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}