"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CategoryDto = {
  id: number;
  name: string;
  count: number;
};

export async function getCategories(): Promise<CategoryDto[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, _count: { select: { skills: true } } },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c._count.skills,
  }));
}

export async function updateCategoryName(id: number, name: string) {
  const nextName = name.trim();
  if (!id || !nextName) {
    throw new Error("Category id and name are required");
  }

  await prisma.category.update({
    where: { id },
    data: { name: nextName.toUpperCase() },
  });

  revalidatePath("/about");
}

export async function deleteCategory(id: number) {
  if (!id) {
    throw new Error("Category id is required");
  }

  await prisma.skill.deleteMany({ where: { categoryId: id } });
  await prisma.category.delete({ where: { id } });
  revalidatePath("/about");
}

