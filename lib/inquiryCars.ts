import type { InquiryCar } from "@/components/contact/WhatsAppContact";
import type { Vehicle } from "@/lib/types";

/** Reduce full vehicle records to what the WhatsApp car picker needs. */
export function toInquiryCars(vehicles: Vehicle[]): InquiryCar[] {
  return vehicles.map((v) => ({
    slug: v.slug,
    fullName: v.fullName,
    price: v.price.formatted,
    mileage: v.mileage.formatted,
    firstRegistration: v.firstRegistration,
    thumb: v.images.main,
  }));
}
