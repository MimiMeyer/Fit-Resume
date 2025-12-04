"use server";

import { prisma } from "@/lib/prisma";

export type JobInput = {
  title: string;
  company: string;
  location?: string;
  stack?: string;
  source?: string;
  matchScore?: number;
  notes?: string;
};

export type SaveJobInput = JobInput & {
  profileId: number;
  status?: string;
};

export async function createJob(input: JobInput) {
  return prisma.job.create({
    data: {
      title: input.title,
      company: input.company,
      location: input.location,
      stack: input.stack,
      source: input.source,
      matchScore: input.matchScore,
      notes: input.notes,
    },
  });
}

export async function saveJobForProfile(input: SaveJobInput) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.create({
      data: {
        title: input.title,
        company: input.company,
        location: input.location,
        stack: input.stack,
        source: input.source,
        matchScore: input.matchScore,
        notes: input.notes,
      },
    });

    const saved = await tx.savedJob.create({
      data: {
        jobId: job.id,
        profileId: input.profileId,
        status: input.status ?? "ready_to_apply",
      },
      include: { job: true },
    });

    return saved;
  });
}

export async function listSavedJobs(profileId?: number) {
  return prisma.savedJob.findMany({
    where: profileId ? { profileId } : undefined,
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSavedJobStatus(params: {
  id: number;
  status: string;
  notes?: string;
}) {
  return prisma.savedJob.update({
    where: { id: params.id },
    data: { status: params.status, notes: params.notes },
    include: { job: true },
  });
}
