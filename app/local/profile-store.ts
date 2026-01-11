"use client";

import type { Profile } from "@/types/profile";
import type { Certification } from "@/types/certification";
import type { Education } from "@/types/education";
import type { Experience } from "@/types/experience";
import type { Project } from "@/types/project";
import type { Skill } from "@/types/skill";
import { moveArrayItem } from "@/lib/moveArrayItem";

type StoredProfileEnvelope = {
  savedAt: string;
  profile: Profile;
};

const DB_NAME = "fitresume";
const DB_VERSION = 1;
const STORE_NAME = "kv";
const PROFILE_KEY = "profile";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function kvGet<T>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value as unknown as object, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function newId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function moveItemById<T extends { id: number }>(items: T[], id: number, direction: "up" | "down") {
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return items;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= items.length) return items;
  return moveArrayItem(items, idx, targetIdx);
}

export function createEmptyProfile(): Profile {
  return {
    id: 1,
    fullName: "",
    summary: null,
    title: null,
    email: null,
    phone: null,
    location: null,
    linkedinUrl: null,
    githubUrl: null,
    websiteUrl: null,
    experiences: [],
    projects: [],
    educations: [],
    certs: [],
    skills: [],
  };
}

export async function loadProfile(): Promise<Profile> {
  const stored = await kvGet<StoredProfileEnvelope>(PROFILE_KEY);
  if (!stored || !stored.profile) {
    const profile = createEmptyProfile();
    await saveProfile(profile);
    return profile;
  }
  return stored.profile;
}

export async function saveProfile(profile: Profile): Promise<void> {
  const envelope: StoredProfileEnvelope = {
    savedAt: new Date().toISOString(),
    profile,
  };
  await kvSet(PROFILE_KEY, envelope);
}

export function updateProfileDetails(profile: Profile, updates: Partial<Profile>): Profile {
  return {
    ...profile,
    ...updates,
    experiences: profile.experiences ?? [],
    projects: profile.projects ?? [],
    educations: profile.educations ?? [],
    certs: profile.certs ?? [],
    skills: profile.skills ?? [],
  };
}

export function addExperience(profile: Profile, input: Omit<Experience, "id">): Profile {
  return {
    ...profile,
    experiences: [...profile.experiences, { id: newId(), ...input }],
  };
}

export function updateExperience(profile: Profile, id: number, input: Omit<Experience, "id">): Profile {
  return {
    ...profile,
    experiences: profile.experiences.map((e) => (e.id === id ? { id, ...input } : e)),
  };
}

export function deleteExperience(profile: Profile, id: number): Profile {
  return { ...profile, experiences: profile.experiences.filter((e) => e.id !== id) };
}

export function moveExperience(profile: Profile, id: number, direction: "up" | "down"): Profile {
  return { ...profile, experiences: moveItemById(profile.experiences, id, direction) };
}

export function addProject(profile: Profile, input: Omit<Project, "id">): Profile {
  return { ...profile, projects: [...profile.projects, { id: newId(), ...input }] };
}

export function updateProject(profile: Profile, id: number, input: Omit<Project, "id">): Profile {
  return { ...profile, projects: profile.projects.map((p) => (p.id === id ? { id, ...input } : p)) };
}

export function deleteProject(profile: Profile, id: number): Profile {
  return { ...profile, projects: profile.projects.filter((p) => p.id !== id) };
}

export function moveProject(profile: Profile, id: number, direction: "up" | "down"): Profile {
  return { ...profile, projects: moveItemById(profile.projects, id, direction) };
}

export function addEducation(profile: Profile, input: Omit<Education, "id">): Profile {
  return { ...profile, educations: [...profile.educations, { id: newId(), ...input }] };
}

export function updateEducation(profile: Profile, id: number, input: Omit<Education, "id">): Profile {
  return {
    ...profile,
    educations: profile.educations.map((e) => (e.id === id ? { id, ...input } : e)),
  };
}

export function deleteEducation(profile: Profile, id: number): Profile {
  return { ...profile, educations: profile.educations.filter((e) => e.id !== id) };
}

export function moveEducation(profile: Profile, id: number, direction: "up" | "down"): Profile {
  return { ...profile, educations: moveItemById(profile.educations, id, direction) };
}

export function addCertification(profile: Profile, input: Omit<Certification, "id">): Profile {
  return { ...profile, certs: [...profile.certs, { id: newId(), ...input }] };
}

export function updateCertification(profile: Profile, id: number, input: Omit<Certification, "id">): Profile {
  return { ...profile, certs: profile.certs.map((c) => (c.id === id ? { id, ...input } : c)) };
}

export function deleteCertification(profile: Profile, id: number): Profile {
  return { ...profile, certs: profile.certs.filter((c) => c.id !== id) };
}

export function moveCertification(profile: Profile, id: number, direction: "up" | "down"): Profile {
  return { ...profile, certs: moveItemById(profile.certs, id, direction) };
}

export function addSkill(profile: Profile, input: { name: string; categoryName: string }): Profile {
  const category = input.categoryName.trim().toUpperCase();
  const normalizedName = input.name.trim();
  if (!normalizedName || !category) return profile;

  const alreadyExists = profile.skills.some((s) => s.name.toLowerCase() === normalizedName.toLowerCase());
  if (alreadyExists) return profile;

  const next: Skill = { id: newId(), name: normalizedName, category: { name: category } };
  return {
    ...profile,
    skills: [...profile.skills, next],
  };
}

export function updateSkill(profile: Profile, id: number, input: { name: string; categoryName: string }): Profile {
  const category = input.categoryName.trim().toUpperCase();
  const normalizedName = input.name.trim();
  if (!normalizedName || !category) return profile;

  return {
    ...profile,
    skills: profile.skills.map((s) =>
      s.id === id ? { ...s, name: normalizedName, category: { name: category } } : s,
    ),
  };
}

export function deleteSkill(profile: Profile, id: number): Profile {
  return { ...profile, skills: profile.skills.filter((s) => s.id !== id) };
}

export function moveSkill(
  profile: Profile,
  id: number,
  opts: { categoryName?: string; beforeId?: number } = {},
): Profile {
  const skills = [...(profile.skills || [])];
  const fromIdx = skills.findIndex((s) => s.id === id);
  if (fromIdx === -1) return profile;

  const [picked] = skills.splice(fromIdx, 1);
  if (!picked) return profile;

  const targetCategory = (opts.categoryName ?? picked.category.name).trim().toUpperCase();
  if (targetCategory) {
    picked.category = { name: targetCategory };
  }

  const beforeId = opts.beforeId ?? null;
  const beforeIdx = beforeId != null ? skills.findIndex((s) => s.id === beforeId) : -1;

  const insertIdx = (() => {
    if (beforeIdx !== -1) return beforeIdx;
    // Append to end of target category group; if category doesn't exist yet, append to end.
    let lastInCategory = -1;
    for (let i = 0; i < skills.length; i += 1) {
      if (skills[i]?.category.name.toUpperCase() === targetCategory) lastInCategory = i;
    }
    return lastInCategory !== -1 ? lastInCategory + 1 : skills.length;
  })();

  skills.splice(insertIdx, 0, picked);
  return { ...profile, skills };
}

export function renameSkillCategory(profile: Profile, from: string, to: string): Profile {
  const source = from.trim().toUpperCase();
  const target = to.trim().toUpperCase();
  if (!source || !target || source === target) return profile;
  return {
    ...profile,
    skills: profile.skills.map((s) => (s.category.name.toUpperCase() === source ? { ...s, category: { name: target } } : s)),
  };
}

export function deleteSkillCategory(profile: Profile, categoryName: string): Profile {
  const target = categoryName.trim().toUpperCase();
  if (!target) return profile;
  return { ...profile, skills: profile.skills.filter((s) => s.category.name.toUpperCase() !== target) };
}
