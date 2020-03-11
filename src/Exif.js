const ExifImage = require('exif').ExifImage;
const dayjs = require('dayjs');

const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

class Exif {
  constructor(fileName) {
    this.fileName = fileName;
    this.exif = {};
    this.exifParsed = {};
  }

  async getExif() {
    const exifPromice = new Promise((resolve, reject) => {
      new ExifImage({ image: this.fileName }, function(error, exifData) {
        if (error) {
          reject(error);
        } else {
          resolve(exifData);
        }
      });
    });
    this.exif = await exifPromice;
  }

  parseExif() {
    const { DateTimeOriginal } = this.exif.exif;
    const dateParsed = dayjs(DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss');
    this.exifParsed = {
      exifDateTimeRaw: dateParsed,
      exifDate: dateParsed.format('YY-MM-DD'),
    };
  }

  get data() {
    this.parseExif();
    return this.exifParsed;
  }
}

module.exports = { Exif };
