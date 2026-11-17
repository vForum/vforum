export const CATEGORIES = [
  { slug: "general", name: "General" },
  { slug: "help", name: "Help & Questions" },
  { slug: "showcase", name: "Showcase" },
  { slug: "off-topic", name: "Off-topic" },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);
