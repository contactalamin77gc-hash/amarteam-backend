import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

const SKIP_KEYS = ['password', 'newPassword', 'confirmPassword', 'token', 'code'];

function stripTags(str: string): string {
  return str
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;
    return this.clean(value);
  }

  private clean(value: any, key?: string): any {
    if (key && SKIP_KEYS.includes(key)) return value;

    if (typeof value === 'string') {
      return stripTags(value);
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