'use strict';

var eslint = require('gulp-eslint');
var fs = require('fs');
var handyman = require('pipeline-handyman');
var path = require('path');
var lazypipe = require('lazypipe');

var esLintConfig = resolveConfigFile('.eslintrc');

module.exports = {
  validateJS: function (options) {
    checkOptions(options);
    handyman.log('Validading js with ESlint');

    return validateES();
  }
};

function checkOptions(options) {
  var dest = JSON.parse(fs.readFileSync(esLintConfig, 'utf8'));
  var customConfig = {};
  var origin = {};

  if ((options && typeof options === 'object' && !Array.isArray(options))
    || (options && typeof options === 'string')) {
    if (typeof options === 'object') {
      esLintConfig = handyman.mergeConfig(dest, options);
    } else {
      customConfig = resolveConfigFile(options);
      origin = JSON.parse(fs.readFileSync(customConfig, 'utf8'));

      esLintConfig = handyman.mergeConfig(dest, origin);
    }
  } else if (options) {
    handyman.log('** Options not valid **');
  }
}

function resolveConfigFile(fileName) {
  var configFilesPathUser = path.resolve(process.cwd(), fileName);
  var configFilesPathDefault = __dirname.substring(0, __dirname.lastIndexOf('/'));

  configFilesPathDefault = path.resolve(configFilesPathDefault, fileName);

  return existsSync(configFilesPathUser) ? configFilesPathUser : configFilesPathDefault;
}

function existsSync(filename) {
  if (typeof fs.accessSync === 'function') {
    try {
      fs.accessSync(filename);
      return true;
    } catch (error) {
      if (typeof error !== 'object' || error.code !== 'ENOENT') {
        handyman.log('Unable to access ' + filename + ':');
        handyman.log(error.stack);
      }
      return false;
    }
  } else {
    return fs.existsSync(filename);
  }
}

function validateES() {
  var stream = lazypipe()
    .pipe(eslint, esLintConfig)
    .pipe(eslint.format)
    .pipe(eslint.failOnError);

  return stream();
}