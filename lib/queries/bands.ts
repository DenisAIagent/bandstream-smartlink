import { auth } from '@/auth'
import { hasBandStreamPermission, BandStreamUserRole } from "@/lib/rbac/roles"

import prisma from '@/lib/prisma'

export async function getUserBandsCount(): Promise<number> {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    if (!userId) {
        throw new Error('User not authenticated');
    }

    // Check if the user has "OWNER" permissions
    if (hasBandStreamPermission(userRole as BandStreamUserRole | undefined, "OWNER")) {
        // Return count of all bands
        const count = await prisma.band.count({
            where: {
                deletedAt: null,
            }
        });
        return count;
    }

    // Return count of bands associated with the user
    const count = await prisma.band.count({
        where: {
            deletedAt: null,
            users: {
                some: {
                    userId: userId
                }
            }
        }
    });
    return count;
}

export async function getBandDataFromDomainName(domainname: string) {
    return prisma.band.findUnique({
      where: { 
        domainname,
        publishedAt: {
          not: null
        },
        unpublishedAt: null
      },
      select: {
        name: true,
        album: true,
        domainname: true,
        umamiWebsiteId: true,
        trackingGTM: true,
        trackingGTAG: true,
        trackingMeta: true,
        coverImage: true,
        musicSample: true,
        ticketingURL: true,
        nextEventDate: true,
        nextEventType: true,
        nextEventLocation: true,
        template: true,
        platforms: {
          select: {
            platform: {
              select: {
                id: true,
                name: true,
                logo: true,
                URL: true,
                shortname: true
              }
            },
            customURL: true
          }
        }
      }
    });
  }

export async function getBands() {
  return prisma.band.findMany({
    where: {
      deletedAt: null
    },
    include: {
      platforms: {
        include: {
          platform: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}