import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'base64',
  standalone: true
})
export class Base64Pipe implements PipeTransform {
  transform(buffer: number[] | Uint8Array): string {
    if (!buffer || !Array.isArray(buffer)) return '';
    const binary = buffer.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binary);
  }

}
