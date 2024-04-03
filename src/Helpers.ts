import path from 'path';
import fs from 'fs';

export const walkSync = (
  dir: string,
  options: { ignoreFolders?: string[]; ignoreFiles?: string[]; extensions?: string[]; onlyFiles?: string[] } = {},
): string[] => {
  const baseDir = path.basename(dir);
  if (
    !fs.existsSync(dir) ||
    (options?.ignoreFolders ?? []).includes(baseDir) ||
    (options?.ignoreFolders ?? []).includes(dir)
  ) {
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
    .filter((v) => {
      if (options?.extensions?.length) {
        return options.extensions.includes(path.parse(v).ext.replace('.', ''));
      }
      return true;
    })
    .filter((v) => {
      if (options?.onlyFiles?.length) {
        return options.onlyFiles.includes(path.basename(v));
      }
      return true;
    });
  return dirs;
};
