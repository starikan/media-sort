import path from 'path';
import fs from 'fs';

export const walkSync = (
  dir: string,
  options: { ignoreFolders?: string[]; extensions?: string[]; ignoreFiles?: string[] } = {},
): string[] => {
  const baseDir = path.basename(dir);
  if (!fs.existsSync(dir) || (options?.ignoreFolders ?? []).includes(baseDir)) {
    return [];
  }
  if (!fs.statSync(dir).isDirectory()) {
    return [dir];
  }
  const dirs = fs
    .readdirSync(dir)
    .map((f) => walkSync(path.join(dir, f), options))
    .flat()
    .filter((v) => !(options?.ignoreFiles ?? []).includes(v))
    .filter((v) => (options?.extensions ?? []).includes(path.parse(v).ext.replace('.', '')));
  return dirs;
};
