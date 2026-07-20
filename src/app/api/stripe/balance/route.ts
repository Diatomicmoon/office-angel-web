import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

export async function GET() {
  try {
    const balance = await stripe.balance.retrieve();
    return NextResponse.json(balance);
  } catch (error) {
    console.error("Error fetching Stripe balance:", error);
    return new NextResponse("Error fetching Stripe balance", { status: 500 });
  }
}
