import path from 'path';
import { walkSync } from './Helpers';

const folders = ['D:/Temp'];

const run = async (): Promise<void> => {
  const dubFiles = folders
    .map((v) => walkSync(v))
    .flat()
    .map((v) => path.basename(v))
    .filter((str, index, arr) => arr.indexOf(str) !== index);

  const files = folders.map((v) => walkSync(v, { onlyFiles: dubFiles })).flat();
  debugger;
};

run();
