import { TransformFnParams, ExposeOptions, Transform } from 'class-transformer';
import * as svgCaptcha from 'svg-captcha';

export const trimmer = (transformFnParams: TransformFnParams) => {
  if (typeof transformFnParams.value === 'string') {
    transformFnParams.value = transformFnParams.value.trim();
  }

  return transformFnParams.value;
};

export const createCaptcha = (): svgCaptcha.CaptchaObj => {
  return svgCaptcha.create({
    charPreset: '1234567890',
    color: true,
    size: 4,
  });
};

export const generateSMSCode = (length: number): string => {
  const chars = '0123456789';
  let numbers = '';

  while (numbers.length < length) {
    const number = chars.charAt(Math.floor(Math.random() * chars.length));

    if (!numbers.includes(number)) {
      numbers += number;
    }
  }

  return numbers;
};

export function TransformMongoId(options?: ExposeOptions) {
  return (target: any, propertyKey: string) => {
    Transform((params) => params.obj[propertyKey]?.toString(), options)(
      target,
      propertyKey,
    );
  };
}

export function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (key === 'password' || key === 'token' || key === 'authenticator') {
      return '******';
    }

    if (value !== null && typeof value === 'object') {
      const sanitizedValue = { ...value };
      for (const keyInValue in value) {
        try {
          JSON.stringify(sanitizedValue[keyInValue]);
        } catch {
          delete sanitizedValue[keyInValue];
        }
      }

      return sanitizedValue;
    }

    return value;
  });
}
