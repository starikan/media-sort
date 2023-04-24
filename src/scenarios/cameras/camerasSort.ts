import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { getFilesFromRecorder } from './service';

const parseDate = (dateString: string): Date => {
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1;
  const day = parseInt(dateString.slice(6, 8), 10);
  const hours = parseInt(dateString.slice(8, 10), 10);
  const minutes = parseInt(dateString.slice(10, 12), 10);
  const seconds = parseInt(dateString.slice(12, 14), 10);

  const parsedDate = new Date(year, month, day, hours, minutes, seconds);

  return parsedDate;
};

// Function to create a nested folder
const createNestedFolder = (dirPath: string): void => {
  const folders = dirPath.split(path.sep);
  let currentPath = '';

  folders.forEach((folder) => {
    currentPath = path.join(currentPath, folder);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
};

const parseName = (
  fileName: string,
  exportFolder: string,
): {
  timestamp: Date;
  timestampString: string;
  camera: string;
  source: string;
  nameNew: string;
  pathNew: string;
  target: string;
} => {
  const fileNameClean = path.basename(fileName).replace(path.extname(fileName), '');
  const fields = fileNameClean.split('_');
  const timestamp = parseDate(fields[3]);
  const timestampString = dayjs(timestamp).format('YYYY-MM-DD_HH-mm-ss');
  const camera = fields[1];
  const ext = path.extname(fileName);
  const pathNew = path.join(
    dayjs(timestamp).format('YYYY'),
    dayjs(timestamp).format('YYYY-MM'),
    dayjs(timestamp).format('YYYY-MM-DD'),
  );
  const nameNew = `${timestampString}[${camera}]${ext}`;
  return {
    timestamp,
    timestampString,
    camera,
    source: fileName,
    nameNew,
    pathNew,
    target: path.join(exportFolder, pathNew, nameNew),
  };
};

const run = async (sourceFolder: string, exportFolder: string): Promise<void> => {
  const files = getFilesFromRecorder(sourceFolder).map((v) => parseName(v, exportFolder));

  if (!fs.existsSync(exportFolder)) {
    fs.mkdirSync(exportFolder);
  }

  files
    .map((v) => v.pathNew)
    .filter((value, index, array) => array.indexOf(value) === index)
    .map((v) => path.join(exportFolder, v))
    .forEach((v) => createNestedFolder(v));

  files.forEach((v, i) => {
    if (!fs.existsSync(v.target)) {
      fs.copyFileSync(v.source, v.target);
      console.log(i, v.source, v.target);
    } else {
      if (!fs.existsSync(path.join(exportFolder, 'conflict'))) {
        fs.mkdirSync(path.join(exportFolder, 'conflict'));
      }
      fs.copyFileSync(v.source, path.join(exportFolder, 'conflict', v.nameNew));
      console.log(i, v.source, path.join(exportFolder, 'conflict', v.nameNew));
    }
  });

  console.log('Done.');
};

run('F:\\', 'D:\\Фотки на синхронизацию\\Камеры\\EXPORT');
// run('D:\\Фотки на синхронизацию\\Камеры\\НГ', 'D:\\Фотки на синхронизацию\\Камеры\\EXPORT_NG');
