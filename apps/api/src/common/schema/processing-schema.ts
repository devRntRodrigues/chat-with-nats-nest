import { Prop, Schema } from '@nestjs/mongoose';
import { baseSchemaOptionsWithoutId } from '@/common/schema/schema-options';

export enum ProcessingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  ERROR = 'error',
}

@Schema(baseSchemaOptionsWithoutId)
export class Processing {
  @Prop({
    type: String,
    enum: ProcessingStatus,
    required: true,
  })
  status: ProcessingStatus;

  @Prop({ type: Date, default: Date.now })
  startedAt?: Date;

  @Prop({ type: Date, default: null })
  finishedAt?: Date | null;

  @Prop()
  lastJob?: string;

  @Prop()
  errorReason?: string;
}
