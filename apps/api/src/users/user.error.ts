import { BadRequestException, NotFoundException } from '@nestjs/common';

export class UserErrors {
  static userNotFoundToReInvite(details: { userId: string }) {
    return new NotFoundException({
      code: 'USR-006',
      message: 'User not founded to re-invite',
      details,
    });
  }

  static errorTryingToDeleteUser(details: { userId: string }) {
    return new NotFoundException({
      code: 'USR-007',
      message: `Error trying to delete user with id ${details.userId}`,
      details,
    });
  }

  static errorTryingToUpdateUser(details: { userId: string }) {
    return new NotFoundException({
      code: 'USR-008',
      message: `Error trying to update user with id ${details.userId}`,
      details,
    });
  }

  static cannotChangeUserStatus(details: { userId: string }) {
    return new BadRequestException({
      code: 'USR-009',
      message:
        'It is not possible to change the status of a user who has not completed their registration!',
      details,
    });
  }

  static cannotChangeUserStatusToPending(details: { userId: string }) {
    return new BadRequestException({
      code: 'USR-010',
      message:
        'It is not possible to change the status of a registered user to pending!',
      details,
    });
  }

  static errorTryingToUpdateUserStatus(details: {
    userId: string;
    status: string;
  }) {
    return new NotFoundException({
      code: 'USR-011',
      message: `Error trying to update user ${details.userId} status to ${details.status}`,
      details,
    });
  }

  static errorTryingToSignupUser(details: { userId: string }) {
    return new NotFoundException({
      code: 'USR-012',
      message: 'Error trying to signup user',
      details,
    });
  }

  static userNotFound(details: { userId: string }) {
    return new NotFoundException({
      code: 'USR-013',
      message: 'User not found',
      details,
    });
  }

  // MAPPED ON IOT-CORE
  // USR-014 Local not allowed to user
  // USR-015 Room already exists
  // USR-016 Failed to send verification code

  static invalidToken(details: { token: string }) {
    return new BadRequestException({
      code: 'USR-017',
      message: 'Invalid token',
      details,
    });
  }

  static invalidPassword(details: { userId: string }) {
    return new BadRequestException({
      code: 'USR-018',
      message: 'Invalid password',
      details,
    });
  }
}
