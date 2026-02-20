import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isIP } from 'net';

export function IsCIDR(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isCIDR',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (typeof value !== 'string') return false;

          const [ip, prefix] = value.split('/');
          if (!ip || !prefix) return false;

          // Check if IP is valid (returns 4 for IPv4, 6 for IPv6, 0 for invalid)
          const ipVersion = isIP(ip);
          if (!ipVersion) return false;

          // Parse and validate prefix length
          const prefixNum = parseInt(prefix, 10);
          if (isNaN(prefixNum)) return false;

          // Validate prefix range based on IP version
          return ipVersion === 4
            ? prefixNum >= 0 && prefixNum <= 32
            : prefixNum >= 0 && prefixNum <= 128;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid IPv4 or IPv6 CIDR notation (e.g., "192.168.1.0/24" or "2001:db8::/32")`;
        },
      },
    });
  };
}
