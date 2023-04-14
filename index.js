require('source-map-support').install();

const { errorHandler, sortFilesFromRecorder } = require('./dist/index').default;

process.on('unhandledRejection', errorHandler);
process.on('SyntaxError', errorHandler);

debugger
if (!module.parent) {
  sortFilesFromRecorder()
} else {
  module.exports = require('./dist/index').default;
}
