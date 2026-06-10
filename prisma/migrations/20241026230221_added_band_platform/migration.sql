-- CreateTable
CREATE TABLE "BandPlatform" (
    "id" SERIAL NOT NULL,
    "bandId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    "customURL" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BandPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BandPlatform_bandId_platformId_key" ON "BandPlatform"("bandId", "platformId");

-- AddForeignKey
ALTER TABLE "BandPlatform" ADD CONSTRAINT "BandPlatform_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BandPlatform" ADD CONSTRAINT "BandPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
