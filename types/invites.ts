// src/types.ts or src/types/types.ts

import { Prisma, User } from '@prisma/client';

export interface UserInvite {
    id: number;
    email: string;
    invitedById: string;
    invitedBy: User;
    createdAt: Date;
}

export interface UserInviteWithInvitedBy extends UserInvite {
    invitedBy: User;
}