import dayjs from 'dayjs';
import { ExifImage } from 'exif';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export class Exif {
  fileName: string;
  exif: any;
  exifParsed: any;

  constructor(fileName) {
    this.fileName = fileName;
    this.exif = {};
    this.exifParsed = {};
  }

  async getExif(): Promise<void> {
    const exifPromice = new Promise((resolve, reject) => {
      // eslint-disable-next-line no-new
      new ExifImage({ image: this.fileName }, (error, exifData) => {
        if (error) {
          reject(error);
        } else {
          resolve(exifData);
        }
      });
    });
    this.exif = await exifPromice;
    this.parseExif();
  }

  parseExif(): void {
    const { DateTimeOriginal } = this.exif.exif;
    const dateParsed = dayjs(DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss');
    this.exifParsed = {
      exifDateTimeRaw: dateParsed,
      exifDate: dateParsed.format('YY-MM-DD'),
    };
  }
}
