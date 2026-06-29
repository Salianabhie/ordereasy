import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const order = await createOrder(slug, body);

  if (!order) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json(order, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const status = request.nextUrl.searchParams.get("status");
  const orders = await getOrders(slug, status);
  return NextResponse.json(orders);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { orderId, status } = await request.json();
  const order = await updateOrderStatus(slug, orderId, status);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
