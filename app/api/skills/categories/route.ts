import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories: categories.map((c) => c.name) });
  } catch (error) {
    console.error("Failed to fetch skill categories:", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
