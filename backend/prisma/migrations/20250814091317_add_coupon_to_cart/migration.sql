-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "appliedCouponId" TEXT;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_appliedCouponId_fkey" FOREIGN KEY ("appliedCouponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
