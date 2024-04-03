import path from 'path';
import fs from 'fs';
import { walkSync } from './Helpers';

interface FileItem {
  fullPath: string;
  fileName: string;
  size?: number;
}

const ignoreFolders = ['G:\\P\\2023\\Разное\\Кино'];

const getDuplicates = async (folders: string[]): Promise<string[]> => {
  const files: FileItem[] = folders
    .map((v) => walkSync(v, { ignoreFolders }))
    .flat()
    .map((v) => ({ fullPath: v, fileName: path.basename(v) }));

  const dubFiles = files.map((v) => v.fileName).filter((str, index, arr) => arr.indexOf(str) !== index);

  const dupFilesFull = files
    .filter((v) => dubFiles.includes(v.fileName))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
    .map((v) => ({ ...v, size: fs.statSync(v.fullPath).size }));

  // Группировка по 'fileName' и 'size'
  const groupByKey = dupFilesFull.reduce((acc: Record<string, FileItem[]>, file) => {
    const key = `${file.fileName}_${file.size}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(file);
    return acc;
  }, {});

  // Фильтрация, оставляя только те элементы, которые имеют дубликаты по 'fileName' и 'size'
  const duplicates = dupFilesFull.filter((file) => {
    const key = `${file.fileName}_${file.size}`;
    return groupByKey[key].length > 1;
  });

  // debugger;

  const result = duplicates.map((v) => v.fullPath);

  console.log(JSON.stringify(result, null, 2));

  return result;
};

const folders = ['G:/P/2011'];

getDuplicates(folders);
