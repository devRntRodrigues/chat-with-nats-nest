import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export class AppErrors {
  static internalServerError(details?: { message: string }) {
    return new InternalServerErrorException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errCode: 'ATH-001',
      details,
    });
  }

  static userInvalidBirthdate(details?: { birthdate: Date }) {
    return new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid birthdate',
      errCode: 'ATH-002',
      details,
    });
  }

  static userNotFound(details?: { [key: string]: string }) {
    return new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      message: 'User not found',
      errCode: 'ATH-003',
      details,
    });
  }

  static invalidCaptcha(details?: { [key: string]: string | number }) {
    return new UnauthorizedException({
      status: HttpStatus.UNAUTHORIZED,
      message: 'Incorrect captcha text',
      errCode: 'ATH-004',
      details,
    });
  }

  static userAlreadyExists(details?: { [key: string]: string | number }) {
    return new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: 'User already exists',
      errCode: 'ATH-005',
      details,
    });
  }

  static invalidVerificationCode(details?: { [key: string]: string | number }) {
    return new ForbiddenException({
      status: HttpStatus.FORBIDDEN,
      message: 'Invalid verification code',
      errCode: 'ATH-006',
      details,
    });
  }

  static clientNotFound(details?: { [key: string]: string }) {
    return new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      message: 'Client not found',
      errCode: 'ATH-007',
      details,
    });
  }

  static invalidRefreshToken(details?: { [key: string]: string }) {
    return new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid refresh token',
      errCode: 'ATH-008',
      details,
    });
  }

  static couldNotSendVerificationCode(details?: { [key: string]: string }) {
    return new InternalServerErrorException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Could not send SMS verification code',
      errCode: 'ATH-009',
      details,
    });
  }

  static invalidCache(details?: { [key: string]: string }) {
    return new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid cache',
      errCode: 'ATH-010',
      details,
    });
  }

  static maxAttempts(details?: { [key: string]: string }) {
    return new ForbiddenException({
      status: HttpStatus.FORBIDDEN,
      message: 'Max attempts reached',
      errCode: 'ATH-011',
      details,
    });
  }

  static invalidAuthorizationCode(details?: {
    [key: string]: string | number;
  }) {
    return new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid authorization code',
      errCode: 'ATH-012',
      details,
    });
  }

  static invalidClientInformation(details?: {
    [key: string]: string | number;
  }) {
    return new ForbiddenException({
      status: HttpStatus.FORBIDDEN,
      message: 'Invalid client information',
      errCode: 'ATH-013',
      details,
    });
  }

  static invalidGrantType(details?: { [key: string]: string | number }) {
    return new InternalServerErrorException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Invalid grant type',
      errCode: 'ATH-014',
      details,
    });
  }

  static invalidSignature(details?: { [key: string]: string }) {
    return new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid signature',
      errCode: 'ATH-015',
      details,
    });
  }
}
