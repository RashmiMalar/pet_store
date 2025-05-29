import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Check if we have a valid 10-digit Indian phone number
    if (digits.length !== 10) {
      return 'Invalid phone number format';
    }
    
    // Format as: +91 XXXXX XXXXX (Indian format)
    return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
  }
}