import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    const categories = skills
      .map((s) => s.category)
      .filter((cat): cat is string => cat !== null && cat.trim() !== "")
      .sort();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch skill categories:", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
