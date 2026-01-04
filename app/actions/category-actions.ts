"use server";

import { revalidatePath } from "next/cache";
import {
  deleteCategory as deleteCategoryRepo,
  getCategoriesWithCounts as getCategoriesWithCountsRepo,
  updateCategoryName as updateCategoryNameRepo,
  type CategoryWithCount,
} from "@/server/profile/profile.repo";


export async function getCategories(): Promise<CategoryWithCount[]> {
  return getCategoriesWithCountsRepo();
}

export async function updateCategoryName(id: number, name: string) {
  await updateCategoryNameRepo(id, name);
  revalidatePath("/profile");
}

export async function deleteCategory(id: number) {
  await deleteCategoryRepo(id);
  revalidatePath("/profile");
}
