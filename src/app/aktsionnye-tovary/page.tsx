import { redirect } from "next/navigation";
import { COLLECTION_SALE_HREF } from "@/lib/site";

/** Legacy path → sale-filtered collection. */
export default function AktsionnyeTovaryRedirect() {
  redirect(COLLECTION_SALE_HREF);
}
