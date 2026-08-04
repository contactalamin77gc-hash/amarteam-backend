import {
  Injectable, BadRequestException,
  OnModuleInit, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

export type CloudinaryResponse = UploadApiResponse;

// Allowed MIME types
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];

// Max sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;      // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;    // 100MB

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private configured = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary is NOT configured — uploads will fail');
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    this.configured = true;
    this.logger.log('Cloudinary configured successfully');
  }

  // ══════════ PUBLIC METHODS ══════════

  async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    this.ensureConfigured();
    this.validateFile(file, IMAGE_TYPES, MAX_IMAGE_SIZE, 'image');

    return this.uploadToCloudinary(file, {
      folder: 'amarteam/images',
      resource_type: 'image',
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      // Strip EXIF/GPS metadata for privacy
      flags: 'strip_profile',
    });
  }

  async uploadProfilePhoto(file: Express.Multer.File): Promise<CloudinaryResponse> {
    this.ensureConfigured();
    this.validateFile(file, IMAGE_TYPES, MAX_IMAGE_SIZE, 'image');

    return this.uploadToCloudinary(file, {
      folder: 'amarteam/photos',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
      flags: 'strip_profile',
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<CloudinaryResponse> {
    this.ensureConfigured();
    this.validateFile(file, VIDEO_TYPES, MAX_VIDEO_SIZE, 'video');

    return this.uploadToCloudinary(file, {
      folder: 'amarteam/videos',
      resource_type: 'video',
      // No eager transformations — those need a paid Cloudinary plan
    });
  }

  async uploadAny(
    file: Express.Multer.File,
    type: 'image' | 'video',
  ): Promise<CloudinaryResponse> {
    return type === 'image' ? this.uploadImage(file) : this.uploadVideo(file);
  }

  async delete(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    if (!publicId || !this.configured) return;

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      this.logger.log(`Deleted ${resourceType} "${publicId}" → ${result.result}`);
    } catch (error) {
      // Deletion failures shouldn't break the calling flow
      this.logger.warn(`Failed to delete ${resourceType} "${publicId}"`, error);
    }
  }

  async deleteMany(
    items: { publicId: string; type?: 'image' | 'video' }[],
  ): Promise<void> {
    await Promise.allSettled(
      items.map(i => this.delete(i.publicId, i.type || 'image')),
    );
  }

  /** Extract the Cloudinary public_id from a full secure URL */
  extractPublicId(url: string): string | null {
    if (!url) return null;
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  // ══════════ VALIDATION ══════════

  private ensureConfigured(): void {
    if (!this.configured) {
      throw new BadRequestException(
        'File uploads are not available right now. Please try again later.',
      );
    }
  }

  private validateFile(
    file: Express.Multer.File,
    allowedTypes: string[],
    maxSize: number,
    label: string,
  ): void {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('The uploaded file is empty');
    }

    // 1. MIME type check
    if (!allowedTypes.includes(file.mimetype)) {
      const readable = allowedTypes
        .map(t => t.split('/')[1].toUpperCase())
        .join(', ');
      throw new BadRequestException(
        `Invalid ${label} format. Allowed: ${readable}`,
      );
    }

    // 2. Size check
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      const actualMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(
        `${label === 'image' ? 'Image' : 'Video'} is ${actualMB}MB — maximum allowed is ${maxMB}MB`,
      );
    }

    // 3. Magic byte check — catches a renamed .exe pretending to be .jpg
    const kind: 'image' | 'video' = label === 'image' ? 'image' : 'video';
    if (!this.checkMagicBytes(file.buffer, kind)) {
      this.logger.warn(
        `Magic byte mismatch: name="${file.originalname}" mime="${file.mimetype}"`,
      );
      throw new BadRequestException(
        'This file does not appear to be a valid ' + label + '. Please upload a real ' + label + ' file.',
      );
    }

    // 4. Filename sanity
    if (file.originalname && file.originalname.length > 255) {
      throw new BadRequestException('Filename is too long');
    }
  }

  /**
   * Inspect the first bytes of the file to confirm it really is
   * the type it claims to be. Prevents malicious file uploads.
   */
  private checkMagicBytes(buffer: Buffer, kind: 'image' | 'video'): boolean {
    if (!buffer || buffer.length < 12) return false;

    const hex = buffer.subarray(0, 16).toString('hex').toUpperCase();

    if (kind === 'image') {
      return (
        hex.startsWith('FFD8FF') ||                                  // JPEG
        hex.startsWith('89504E470D0A1A0A') ||                        // PNG
        hex.startsWith('474946383761') ||                            // GIF87a
        hex.startsWith('474946383961') ||                            // GIF89a
        (hex.startsWith('52494646') && hex.substring(16, 24) === '57454250') // RIFF....WEBP
      );
    }

    // Video
    return (
      hex.substring(8, 16) === '66747970' ||   // ....ftyp  → MP4 / MOV / M4V
      hex.startsWith('1A45DFA3') ||            // WebM / Matroska
      hex.startsWith('52494646') ||            // RIFF → AVI
      hex.startsWith('000001BA') ||            // MPEG-PS
      hex.startsWith('000001B3') ||            // MPEG video
      hex.startsWith('3026B275')               // ASF / WMV
    );
  }

  // ══════════ UPLOAD ══════════

  private uploadToCloudinary(
    file: Express.Multer.File,
    options: Record<string, any>,
  ): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new BadRequestException('Upload timed out. Please try a smaller file.'));
      }, 120_000); // 2 minutes

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...options,
          // Never trust a user-supplied filename as the public_id
          use_filename: false,
          unique_filename: true,
          overwrite: false,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          clearTimeout(timeout);

          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            // Don't leak Cloudinary internals to the client
            reject(new BadRequestException('Upload failed. Please try again.'));
            return;
          }

          if (!result) {
            reject(new BadRequestException('Upload failed — no response received.'));
            return;
          }

          this.logger.log(
            `Uploaded ${options.resource_type}: ${result.public_id} (${Math.round(result.bytes / 1024)}KB)`,
          );
          resolve(result);
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}