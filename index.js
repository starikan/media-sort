const fs = require('fs');
const path = require('path');

const walkSync = require('walk-sync');
require('polyfill-object.fromentries');

const { Exif } = require('./src/Exif.js');

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
    DELETE_SOURCE: !(DELETE_SOURCE === 'false'),
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
  dates.fileDate = formaDate(stat.mtime, { year: 'numeric', month: '2-digit', day: '2-digit' });
  dates.fileDateMonth = formaDate(stat.mtime, { year: 'numeric', month: '2-digit' });
  dates.fileDateYear = formaDate(stat.mtime, { year: 'numeric' });

  return dates;
};

const extractParams = async v => {
  let exif = {};
  try {
    const exifInstance = new Exif(v);
    await exifInstance.getExif();
    exif = exifInstance.data;
  } finally {
  }

  let data = {};
  data.filePath = v;
  data.fileName = path.parse(v).name;
  data.fileFullName = path.parse(v).base;
  data.fileExt = path.parse(v).ext;
  data.fileType = ALLOW_IMAGES.includes(data.fileExt) ? 'image' : 'video';
  data = { ...data, ...getDateFromFile(v) };
  data.fileDestination = path.join(EXPORT_PATH, data.fileDateMonth, data.fileDate, data.fileFullName);
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

const run = async () => {
  createExportFolder();
  const allImages = await Promise.all(getFiles(ALLOW_IMAGES_FILTER).map(async v => await extractParams(v)));
  const allVideos = await Promise.all(getFiles(ALLOW_VIDEOS_FILTER).map(async v => await extractParams(v)));

  generateFolders(allImages);
  generateFolders(allVideos);

  DELETE_SOURCE ? moveFiles(allImages) : copyFiles(allImages);
  DELETE_SOURCE ? moveFiles(allVideos) : copyFiles(allVideos);

  console.log('DONE!');
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

run();
