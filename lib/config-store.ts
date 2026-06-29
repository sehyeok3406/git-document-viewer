"use client";

import type { SelectedDocsConfig, SetupDraft } from "@/lib/types";

const SELECTED_CONFIG_KEY = "git-document-viewer:selected-config";
const SETUP_DRAFT_KEY = "git-document-viewer:setup-draft";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSelectedDocsConfig() {
  return readJson<SelectedDocsConfig>(SELECTED_CONFIG_KEY);
}

export function saveSelectedDocsConfig(config: SelectedDocsConfig) {
  writeJson(SELECTED_CONFIG_KEY, config);
}

export function clearSelectedDocsConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SELECTED_CONFIG_KEY);
}

export function getSetupDraft() {
  return readJson<SetupDraft>(SETUP_DRAFT_KEY) ?? {};
}

export function saveSetupDraft(draft: SetupDraft) {
  const previous = getSetupDraft();
  writeJson(SETUP_DRAFT_KEY, { ...previous, ...draft });
}

export function clearSetupDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SETUP_DRAFT_KEY);
}
