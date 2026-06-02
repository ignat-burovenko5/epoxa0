import { redirect } from "next/navigation";
import { blogAdminBlogPath } from "@/lib/blog/urls";

/** Legacy `/dashboard` → blog section on CMS hub. */
export default function BlogDashboardRedirect() {
  redirect(blogAdminBlogPath());
}
