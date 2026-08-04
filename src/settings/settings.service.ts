import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private repo: Repository<Setting>,
    private uploadService: UploadService,
  ) {}

  async getAll(): Promise<Record<string, { value: string; publicId?: string }>> {
    const rows = await this.repo.find();
    const out: Record<string, any> = {};
    rows.forEach(r => { out[r.key] = { value: r.value, publicId: r.publicId }; });
    return out;
  }

  async get(key: string): Promise<Setting | null> {
    return this.repo.findOne({ where: { key } });
  }

  async set(key: string, value: string, publicId?: string): Promise<Setting> {
    let row = await this.repo.findOne({ where: { key } });

    if (row) {
      // Delete old Cloudinary asset if replacing an image
      if (publicId && row.publicId && row.publicId !== publicId) {
        await this.uploadService.delete(row.publicId, 'image');
      }
      row.value = value;
      if (publicId !== undefined) row.publicId = publicId;
    } else {
      row = this.repo.create({ key, value, publicId });
    }

    return this.repo.save(row);
  }

  async remove(key: string): Promise<void> {
    const row = await this.repo.findOne({ where: { key } });
    if (!row) return;
    if (row.publicId) await this.uploadService.delete(row.publicId, 'image');
    await this.repo.remove(row);
  }
}