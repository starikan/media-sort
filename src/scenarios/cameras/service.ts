import path from 'path';
import { walkSync } from '../../Helpers';

export const getFilesFromRecorder = (dir: string = process.cwd()): string[] => {
  const dirFull = path.resolve(dir);
  const files = walkSync(dirFull, { extensions: ['mp4'] });
  return files;
};
