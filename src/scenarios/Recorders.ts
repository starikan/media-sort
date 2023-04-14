import path from 'path';
import { walkSync } from '../Helpers';

export const renameFilesFromRecorder = (dir: string = process.cwd()): void => {
  const dirFull = path.resolve(dir);
  const files = walkSync(dirFull);
  debugger;
};

export const sortFilesFromRecorder = (dir: string = process.cwd()): void => {
  renameFilesFromRecorder(dir);
};
