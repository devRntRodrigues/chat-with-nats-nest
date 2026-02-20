import { Transform } from 'class-transformer';
import { SortOrder } from '../dto/pagination-query-req.dto';

export function TransformSortOrder() {
  return Transform(({ value }) => {
    if (value === -1 || value === '-1') {
      return SortOrder.DESC;
    } else if (value === 1 || value === '1') {
      return SortOrder.ASC;
    } else if (Object.values(SortOrder).includes(value)) {
      return value;
    }
    throw new Error('Invalid sort order value');
  });
}
