import type { User } from '@/users/user.schema';
import { Roles } from './roles.constants';

export type Action =
  | 'manage'
  | 'create'
  | 'add'
  | 'read'
  | 'update'
  | 'activate'
  | 'deactivate'
  | 'approve'
  | 'deny'
  | 'delete'
  | 'remove'
  | 'list';

export type Subject = 'User';

export function hasRoles(activeUser: User, roles: Roles[]) {
  return roles.some((role) => activeUser.roles.includes(role));
}
