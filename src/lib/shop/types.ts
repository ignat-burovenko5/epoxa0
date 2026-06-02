export type ShopLeadLine = {
  slug: string;
  title: string;
  price: number;
};

export type ShopLead = {
  id: string;
  at: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  delivery: string;
  payment: string;
  subtotal: number;
  itemCount: number;
  lines: ShopLeadLine[];
  whiteGlove?: boolean;
  videoCall?: boolean;
  comment?: string;
};

export type ShopLeadsStore = {
  version: 1;
  leads: ShopLead[];
  updatedAt: string;
};
