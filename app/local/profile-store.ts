"use client";

import type { Profile } from "@/types/profile";
import type { Certification } from "@/types/certification";
import type { Education } from "@/types/education";
import type { Experience } from "@/types/experience";
import type { Project } from "@/types/project";
import type { Skill } from "@/types/skill";

type StoredProfileEnvelopeV1 = {
  schemaVersion: 1;
  savedAt: string;
  profile: Profile;
};

const DB_NAME = "fitresume";
const DB_VERSION = 1;
const STORE_NAME = "kv";
const PROFILE_KEY = "profile.v1";

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

export function createEmptyProfile(): Profile {
  return {
    id: 1,
    fullName: "Your Name",
    headline: null,
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
  const stored = await kvGet<StoredProfileEnvelopeV1>(PROFILE_KEY);
  if (!stored || stored.schemaVersion !== 1 || !stored.profile) {
    const profile = createEmptyProfile();
    await saveProfile(profile);
    return profile;
  }
  return stored.profile;
}

export async function saveProfile(profile: Profile): Promise<void> {
  const envelope: StoredProfileEnvelopeV1 = {
    schemaVersion: 1,
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

export function addProject(profile: Profile, input: Omit<Project, "id">): Profile {
  return { ...profile, projects: [...profile.projects, { id: newId(), ...input }] };
}

export function updateProject(profile: Profile, id: number, input: Omit<Project, "id">): Profile {
  return { ...profile, projects: profile.projects.map((p) => (p.id === id ? { id, ...input } : p)) };
}

export function deleteProject(profile: Profile, id: number): Profile {
  return { ...profile, projects: profile.projects.filter((p) => p.id !== id) };
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

export function addCertification(profile: Profile, input: Omit<Certification, "id">): Profile {
  return { ...profile, certs: [...profile.certs, { id: newId(), ...input }] };
}

export function updateCertification(profile: Profile, id: number, input: Omit<Certification, "id">): Profile {
  return { ...profile, certs: profile.certs.map((c) => (c.id === id ? { id, ...input } : c)) };
}

export function deleteCertification(profile: Profile, id: number): Profile {
  return { ...profile, certs: profile.certs.filter((c) => c.id !== id) };
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
    skills: [...profile.skills, next].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function updateSkill(profile: Profile, id: number, input: { name: string; categoryName: string }): Profile {
  const category = input.categoryName.trim().toUpperCase();
  const normalizedName = input.name.trim();
  if (!normalizedName || !category) return profile;

  return {
    ...profile,
    skills: profile.skills
      .map((s) => (s.id === id ? { ...s, name: normalizedName, category: { name: category } } : s))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function deleteSkill(profile: Profile, id: number): Profile {
  return { ...profile, skills: profile.skills.filter((s) => s.id !== id) };
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

