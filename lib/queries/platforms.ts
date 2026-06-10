import prisma from '@/lib/prisma'

export async function getPlatformsCount(): Promise<number> {
    const count = await prisma.platform.count({
        where: {
            deletedAt: null
        }
    })
    return count
}