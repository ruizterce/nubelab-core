import { getContentEntries } from "@/content/source";

const platformModules = [
  {
    slug: "atlas",
    title: "Systems Atlas",
    description: "Architectures, relationships, domains, and technical maps.",
    state: "mapped",
  },
  {
    slug: "labs",
    title: "Automation Labs",
    description: "Experiments, prototypes, workflow tools, and AI-assisted operations.",
    state: "open",
  },
  {
    slug: "notes",
    title: "Field Notes",
    description: "Short technical observations, tradeoffs, and implementation lessons.",
    state: "seeded",
  },
  {
    slug: "integrations",
    title: "Integration Layer",
    description: "ERP, MES, cloud, infrastructure, and industrial systems connections.",
    state: "planned",
  },
  {
    slug: "operations",
    title: "Operational Boundary",
    description: "Links and safe previews into real runtime environments.",
    state: "sealed",
  },
];

export function getFeaturedEntries() {
  return getContentEntries("en").slice(0, 4);
}

export function getPlatformModules() {
  return platformModules;
}
