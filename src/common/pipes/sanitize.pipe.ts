import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

const SKIP_KEYS = ['password', 'newPassword', 'confirmPassword', 'token', 'code'];

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;
    return this.clean(value);
  }

  private clean(value: any, key?: string): any {
    if (key && SKIP_KEYS.includes(key)) return value;

    if (typeof value === 'string') {
      return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
    }
    if (Array.isArray(value)) {
      return value.map(v => this.clean(v));
    }
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      const out: any = {};
      for (const k of Object.keys(value)) out[k] = this.clean(value[k], k);
      return out;
    }
    return value;
  }
}