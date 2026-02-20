import type { Roles } from '@/iam/authorization/roles.constants';

export type ActiveUserType = 'APP' | 'INTERNAL';

export interface ActiveUser {
  _id: string;
  type: ActiveUserType;
  email: string;
  name: string;
  partner: string | null;
  roles: Roles[];
  local: {
    id: string;
    isAdmin: boolean;
  };
}
