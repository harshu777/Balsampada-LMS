import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('materials')
@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @Roles('TEACHER', 'ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload study material' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        subjectId: {
          type: 'string',
        },
      },
    },
  })
  create(
    @Body() createMaterialDto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.materialsService.create(createMaterialDto, file, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  findAll(@Query('subjectId') subjectId: string, @Req() req) {
    return this.materialsService.findAll(subjectId, req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.materialsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Update material' })
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Req() req,
  ) {
    return this.materialsService.update(id, updateMaterialDto, req.user.id);
  }

  @Delete(':id')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Delete material' })
  remove(@Param('id') id: string, @Req() req) {
    return this.materialsService.remove(id, req.user.id, req.user.role);
  }
}