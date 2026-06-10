// src/types.ts or src/types/types.ts

import { Prisma, User } from '@prisma/client';

// Export the type so it can be imported elsewhere
export type BandWithPlatforms = Prisma.BandGetPayload<{
  include: {
    platforms: {
      include: {
        platform: true;
      };
    };
  };
}>;

export interface Platform {
  id: number;
  name: string;
  logo?: string | null;
  URL: string;
  shortname: string;
}

export interface PlatformData {
  platform: Platform;
  customURL: string;
}

export interface BandPlatform {
  platform: Platform;
  customURL: string;
}

export interface Band {
  id: number;
  name: string;
  domainname: string;
  album: string | null;
  coverImage: string | null;
  musicSample: string | null;
  trackingGTM: string | null;
  trackingGTAG: string | null;
  trackingMeta: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  publishedAt: Date | null;
  unpublishedAt: Date | null;
  platforms: BandPlatform[];
  users: UserBand[];
  ticketingURL: string | null;
  nextEventDate: Date | null;
  nextEventType: string | null;
  nextEventLocation: string | null;
  template: string;
  umamiWebsiteId?: string | null;
}

export interface UserBand {
  userId: string;
  bandId: number;
  user: User;
  band: Band;
}