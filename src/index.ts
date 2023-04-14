/* eslint-disable import/no-import-module-exports */
import { errorHandler } from './Errors';
import { sortFilesFromRecorder } from './scenarios/Recorders';

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

export default {
  errorHandler,
  sortFilesFromRecorder,
};

if (!module.children.length) {
  sortFilesFromRecorder();
}
