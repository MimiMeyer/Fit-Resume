-- Ensure all skills have a category.
-- If any legacy rows exist without a category, remove them before enforcing NOT NULL.

DELETE FROM "Skill" WHERE "categoryId" IS NULL;

ALTER TABLE "Skill" ALTER COLUMN "categoryId" SET NOT NULL;

