"use client";

import type { SelectedDocsConfig, SetupDraft } from "@/lib/types";

const SELECTED_CONFIG_KEY = "git-document-viewer:selected-config";
const SAVED_CONFIGS_KEY = "git-document-viewer:saved-configs";
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

export function docsConfigId(config: SelectedDocsConfig) {
  return [
    config.installationId,
    config.owner,
    config.repo,
    config.branch,
    config.docsPath || "/",
  ].join(":");
}

function normalizeConfig(config: SelectedDocsConfig): SelectedDocsConfig {
  return {
    ...config,
    repoFullName: config.repoFullName || `${config.owner}/${config.repo}`,
    configId: config.configId || docsConfigId(config),
  };
}

function dedupeConfigs(configs: SelectedDocsConfig[]) {
  const map = new Map<string, SelectedDocsConfig>();
  for (const config of configs) {
    const normalized = normalizeConfig(config);
    map.set(normalized.configId ?? docsConfigId(normalized), normalized);
  }
  return Array.from(map.values()).sort((a, b) => b.selectedAt.localeCompare(a.selectedAt));
}

export function getSavedDocsConfigs() {
  const saved = readJson<SelectedDocsConfig[]>(SAVED_CONFIGS_KEY) ?? [];
  const selected = readJson<SelectedDocsConfig>(SELECTED_CONFIG_KEY);
  return dedupeConfigs(selected ? [selected, ...saved] : saved);
}

export function getSelectedDocsConfig(): SelectedDocsConfig | null {
  const selected = readJson<SelectedDocsConfig>(SELECTED_CONFIG_KEY);
  if (selected) return normalizeConfig(selected);
  return getSavedDocsConfigs()[0] ?? null;
}

export function saveSelectedDocsConfig(config: SelectedDocsConfig) {
  const normalized = normalizeConfig(config);
  const saved = getSavedDocsConfigs().filter((item) => item.configId !== normalized.configId);
  writeJson(SELECTED_CONFIG_KEY, normalized);
  writeJson(SAVED_CONFIGS_KEY, [normalized, ...saved]);
}

export function removeSavedDocsConfig(configId: string) {
  const saved = getSavedDocsConfigs().filter((config) => config.configId !== configId);
  writeJson(SAVED_CONFIGS_KEY, saved);

  const selected = getSelectedDocsConfig();
  if (selected?.configId === configId) {
    if (saved[0]) {
      writeJson(SELECTED_CONFIG_KEY, saved[0]);
    } else {
      window.localStorage.removeItem(SELECTED_CONFIG_KEY);
    }
  }
}

export function clearSelectedDocsConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SELECTED_CONFIG_KEY);
  window.localStorage.removeItem(SAVED_CONFIGS_KEY);
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
