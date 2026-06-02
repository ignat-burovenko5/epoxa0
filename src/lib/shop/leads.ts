import { backendFetch } from "@/lib/backend/client";
import type { ShopLead, ShopLeadsStore } from "@/lib/shop/types";

export async function readLeadsStore(): Promise<ShopLeadsStore> {
  return backendFetch<ShopLeadsStore>("/api/shop/internal/store");
}

export async function appendShopLead(lead: ShopLead): Promise<ShopLead> {
  const res = await backendFetch<{ ok: boolean; id: string }>("/api/shop/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      subtotal: lead.subtotal,
      lines: lead.lines,
    }),
  });
  return { ...lead, id: res.id };
}

export async function getRecentLeads(limit = 12): Promise<ShopLead[]> {
  const data = await backendFetch<{ leads: ShopLead[] }>(
    `/api/shop/internal/leads?limit=${limit}`,
  );
  return data.leads;
}
