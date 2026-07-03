import path from "node:path";

// Resolve the sqlite file to an absolute path at runtime: when bundled by
// Turbopack/webpack, the generated client's own relative-path resolution
// (based on import.meta.url) points at the bundle chunk instead of the
// original prisma/ folder, so a plain relative DATABASE_URL breaks. Prisma
// convention is that "file:" paths in DATABASE_URL are relative to the
// prisma/ folder (where schema.prisma lives), so we resolve them the same
// way here, relative to the project root (process.cwd()).
export function resolveDatasourceUrl() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!url.startsWith("file:")) return url;

  const relativePath = url.slice("file:".length);
  if (path.isAbsolute(relativePath)) return url;

  return `file:${path.resolve(process.cwd(), "prisma", relativePath)}`;
}
