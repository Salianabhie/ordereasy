export interface BillLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Bill {
  lineItems: BillLineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
}

export function calculateBill(
  items: { name: string; quantity: number; unitPrice: number }[],
  taxRate: number
): Bill {
  const lineItems = items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { lineItems, subtotal, tax, taxRate, total };
}
