import { Expose } from 'class-transformer';
import { TransformMongoId } from '../../common/utils';

export class ClientResponseNewClientDto {
  @Expose()
  @TransformMongoId()
  _id: string;

  @Expose()
  clientId: string;

  @Expose()
  secret: string;

  @Expose()
  publicKey: string;

  @Expose()
  redirectUris: string[];

  @Expose()
  description: string;

  @Expose()
  roles: string;
}

export class ClientResponseUpdateClientDto {
  @Expose()
  @TransformMongoId()
  _id: string;

  @Expose()
  clientId: string;

  @Expose()
  redirectUris: string[];

  @Expose()
  description: string;

  @Expose()
  roles: string;
}

export class ClientResponseRefreshClientDto {
  @Expose()
  @TransformMongoId()
  _id: string;

  @Expose()
  clientId: string;

  @Expose()
  secret: string;

  @Expose()
  redirectUris: string[];

  @Expose()
  description: string;

  @Expose()
  roles: string;
}
