import * as fs from 'fs';
import * as path from 'path';

import walkSync from 'walk-sync'

import { Exif } from './Exif.js';

const DEFAULTS = {
  ROOT: process.cwd(),
  EXPORT_FOLDER: 'export',
  ALLOW_IMAGES: '.jpg, .jpeg, .JPG, .JPEG',
  ALLOW_VIDEOS: '.mp4, .MTS, .3gp',
  DELETE_SOURCE: true,
};

const parseCLI = () => {
  const argsRaw = Object.fromEntries(
    process.argv
      .map(v => v.split(/\s+/))
      .flat()
      .map(v => v.split('='))
      .filter(v => v.length > 1),
  );
  return argsRaw;
};

const generateConsts = () => {
  const { ROOT, EXPORT_FOLDER, ALLOW_IMAGES, ALLOW_VIDEOS, DELETE_SOURCE } = { ...DEFAULTS, ...parseCLI() };

  return {
    ROOT,
    EXPORT_FOLDER,
    ALLOW_IMAGES: ALLOW_IMAGES.split(/\s*,\s*/),
    ALLOW_VIDEOS: ALLOW_VIDEOS.split(/\s*,\s*/),
    EXPORT_PATH: path.join(ROOT, EXPORT_FOLDER),
    ALLOW_IMAGES_FILTER: ALLOW_IMAGES.split(/\s*,\s*/).map(v => `**/*${v}`),
    ALLOW_VIDEOS_FILTER: ALLOW_VIDEOS.split(/\s*,\s*/).map(v => `**/*${v}`),
    DELETE_SOURCE: DELETE_SOURCE !== 'false',
  };
};

const createExportFolder = () => {
  if (!fs.existsSync(EXPORT_PATH)) {
    fs.mkdirSync(EXPORT_PATH);
  }
};

const getFiles = (globs, root = ROOT) => {
  const allFiles = walkSync(root, { ignore: [EXPORT_FOLDER], includeBasePath: true, globs: globs });
  return allFiles;
};

const formaDate = (date, options = { year: 'numeric', month: '2-digit', day: '2-digit' }) => {
  return new Intl.DateTimeFormat('ru-RU', options).format(date);
};

const getDateFromFile = fileName => {
  const stat = fs.statSync(fileName);

  const dates = {};
  dates.fileDate = formaDate(stat.mtime, { year: '2-digit', month: '2-digit', day: '2-digit' });
  dates.fileDateMonth = formaDate(stat.mtime, { year: '2-digit', month: '2-digit' });
  dates.fileDateYear = formaDate(stat.mtime, { year: 'numeric' });

  return dates;
};

const extractParams = async v => {
  console.log(v);

  let exif = {};
  let data = {};
  data.filePath = v;
  data.fileName = path.parse(v).name;
  data.fileFullName = path.parse(v).base;
  data.fileExt = path.parse(v).ext;
  data.fileType = ALLOW_IMAGES.includes(data.fileExt) ? 'image' : 'video';
  data = { ...data, ...getDateFromFile(v) };
  data.fileDestination = path.join(EXPORT_PATH, data.fileDateMonth, data.fileDate, data.fileFullName);

  try {
    if (data.fileType === 'image') {
      const exifInstance = new Exif(v);
      await exifInstance.getExif();
      exif = exifInstance.data;
    }
  } catch (error) {
    console.log(`Exif: ${error}`);
  }

  data = data.fileType === 'image' ? { ...data, ...exif } : data;
  return data;
};

const generateFolders = files => {
  const months = files.reduce((s, v) => {
    const month = v.fileDateMonth;
    const day = v.fileDate;

    if (month) {
      s[month] = [...new Set([...(s[month] || []), day])];
    }
    return s;
  }, {});

  Object.keys(months)
    .map(v => path.join(EXPORT_PATH, v))
    .map(v => (!fs.existsSync(v) ? fs.mkdirSync(v) : null));

  Object.entries(months)
    .flatMap(v => v[1].map(name => path.join(EXPORT_PATH, v[0], name)))
    .map(v => (!fs.existsSync(v) ? fs.mkdirSync(v) : null));
};

const moveFiles = files => {
  files.map(f => {
    if (!fs.existsSync(f.fileDestination)) {
      fs.renameSync(f.filePath, f.fileDestination);
    }
  });
};

const copyFiles = files => {
  files.map(f => {
    if (!fs.existsSync(f.fileDestination)) {
      fs.copyFileSync(f.filePath, f.fileDestination);
    }
  });
};

const filterBad = files => {
  const allowFiles = files.filter(v => v.exifDate === v.fileDate || !v.exifDate);
  const badFiles = files.filter(v => v.exifDate && v.exifDate !== v.fileDate);
  return [allowFiles, badFiles];
};

const logBads = files => {
  const formedFiles = files.map(v => ({
    fileName: v.fileName,
    exifDate: v.exifDate,
    fileDate: v.fileDate,
    fileType: v.fileType,
  }));
  formedFiles.length ? console.log('BAD FILES') : null;
  formedFiles.length ? console.table(formedFiles) : null;
};

const {
  ROOT,
  EXPORT_PATH,
  ALLOW_IMAGES,
  ALLOW_VIDEOS,
  DELETE_SOURCE,
  EXPORT_FOLDER,
  ALLOW_IMAGES_FILTER,
  ALLOW_VIDEOS_FILTER,
} = generateConsts();

export async function run() {
  createExportFolder();

  const allImages = getFiles(ALLOW_IMAGES_FILTER);
  for (let i = 0; i < allImages.length; i++) {
    allImages[i] = await extractParams(allImages[i]);
  }

  const allVideos = getFiles(ALLOW_VIDEOS_FILTER);
  for (let i = 0; i < allVideos.length; i++) {
    allVideos[i] = await extractParams(allVideos[i]);
  }

  const [allowImages, badImages] = filterBad(allImages);
  const [allowVideos, badVideos] = filterBad(allVideos);

  generateFolders(allowImages);
  generateFolders(allowVideos);

  DELETE_SOURCE ? moveFiles(allowImages) : copyFiles(allowImages);
  DELETE_SOURCE ? moveFiles(allowVideos) : copyFiles(allowVideos);

  logBads(badImages);
  logBads(badVideos);

  console.log('DONE!');
}
