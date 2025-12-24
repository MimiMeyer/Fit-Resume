"use server";

import { revalidatePath } from "next/cache";
import {
  deleteCategory as deleteCategoryRepo,
  getCategoriesWithCounts,
  updateCategoryName as updateCategoryNameRepo,
  type CategoryWithCount,
} from "@/server/profile/profile.repo";


export async function getCategories(): Promise<CategoryWithCount[]> {
  return getCategoriesWithCounts();
}

export async function updateCategoryName(id: number, name: string) {
  await updateCategoryNameRepo(id, name);
  revalidatePath("/about");
}

export async function deleteCategory(id: number) {
  await deleteCategoryRepo(id);
  revalidatePath("/about");
}

