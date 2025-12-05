import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, _count: { select: { skills: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.skills,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body?.name as string | undefined)?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const upper = name.toUpperCase();
    const category = await prisma.category.upsert({
      where: { name: upper },
      update: {},
      create: { name: upper },
    });
    revalidatePath("/about");
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Failed to create category", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    const name = (body?.name as string | undefined)?.trim();
    if (!id || !name) {
      return NextResponse.json({ error: "Category id and name are required" }, { status: 400 });
    }
    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.toUpperCase() },
    });
    revalidatePath("/about");
    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Failed to update category", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    // Delete skills attached to this category
    await prisma.skill.deleteMany({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });
    revalidatePath("/about");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete category", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
