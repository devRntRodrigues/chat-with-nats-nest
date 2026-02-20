import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { FindClientByClientIdHandler } from './handlers/find-client-by-client-id.handler';

@Injectable()
export class OAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly findClientByClientIdHandler: FindClientByClientIdHandler,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const { clientId } = this.jwtService.decode<{ clientId: string }>(token);

    const client = await this.findClientByClientIdHandler.execute({ clientId });

    if (!client) {
      throw new UnauthorizedException();
    }

    try {
      await this.jwtService.verifyAsync(token, {
        publicKey: client.publicKey,
      });
      request['client'] = client.toObject();
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
