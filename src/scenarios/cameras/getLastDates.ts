import path from 'path';
import { getFilesFromRecorder } from './service';

const run = async (sourceFolder: string): Promise<void> => {
  const files = getFilesFromRecorder(sourceFolder)
    .map((v) => path.basename(v, path.extname(v)))
    .map((v) => v.replace(']', ''))
    .map((v) => v.split('['))
    .reduce((acc: Record<string, string>, v) => {
      if (!acc[v[1]]) {
        // eslint-disable-next-line prefer-destructuring
        acc[v[1]] = v[0];
        return acc;
      }
      acc[v[1]] = v[0] > acc[v[1]] ? v[0] : acc[v[1]];
      return acc;
    }, {});

  // debugger;
  console.log(JSON.stringify(files, null, 2));
  console.log('Done.');
};

run('D:\\Фотки на синхронизацию\\Камеры\\EXPORT');
