import {
  Controller, Post, UseInterceptors,
  UploadedFile, UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums';

const storage = memoryStorage();

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @UseInterceptors(FileInterceptor('file', {
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadImage(file);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  @Public()
  @Post('public/image')
  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @UseInterceptors(FileInterceptor('file', {
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadPublicImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadImage(file);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  @Post('video')
  @Roles(Role.PLAYER, Role.ADMIN)
  @Throttle({ default: { ttl: 300000, limit: 5 } })
  @UseInterceptors(FileInterceptor('file', {
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
  }))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadVideo(file);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      thumbnailUrl: result.secure_url.replace(/\.\w+$/, '.jpg'),
    };
  }

  @Post('images')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseInterceptors(FilesInterceptor('files', 6, {
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    const results = await Promise.all(
      files.map(f => this.uploadService.uploadImage(f)),
    );
    return results.map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
    }));
  }

  @Post('videos')
  @Roles(Role.PLAYER, Role.ADMIN)
  @Throttle({ default: { ttl: 300000, limit: 3 } })
  @UseInterceptors(FilesInterceptor('files', 3, {
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
  }))
  async uploadMultipleVideos(@UploadedFiles() files: Express.Multer.File[]) {
    const results = await Promise.all(
      files.map(f => this.uploadService.uploadVideo(f)),
    );
    return results.map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
      duration: r.duration,
      thumbnailUrl: r.secure_url.replace(/\.\w+$/, '.jpg'),
    }));
  }
}