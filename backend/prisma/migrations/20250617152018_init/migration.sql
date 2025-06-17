-- CreateTable
CREATE TABLE "code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isExpired" BOOLEAN NOT NULL,

    CONSTRAINT "code_pkey" PRIMARY KEY ("id")
);
