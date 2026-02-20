import { Types } from 'mongoose';
import { TransformMongoId } from '../decorators/transform-mongo-id.decorator';

export class BaseSchema {
  @TransformMongoId()
  _id: Types.ObjectId;
}

export class BaseSchemaWithTimestamps extends BaseSchema {
  createdAt?: Date;
  updatedAt?: Date;
}
