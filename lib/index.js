'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _swPrecache = require('sw-precache');

var _swPrecache2 = _interopRequireDefault(_swPrecache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_CACHE_ID = 'sw-precache-webpack-plugin',
    DEFAULT_WORKER_FILENAME = 'service-worker.js',
    DEFAULT_OUTPUT_PATH = '';

var DEFAULT_OPTIONS = {
  cacheId: DEFAULT_CACHE_ID,
  filename: DEFAULT_WORKER_FILENAME
};

/**
 * SWPrecacheWebpackPlugin - A wrapper for sw-precache to use with webpack
 * @param {object} options - All parameters should be passed as a single options object
 *
 * // sw-precache options:
 * @param {string} [options.cacheId]
 * @param {string} [options.directoryIndex]
 * @param {object|array} [options.dynamicUrlToDependencies]
 * @param {boolean} [options.handleFetch]
 * @param {array} [options.ignoreUrlParametersMatching]
 * @param {array} [options.importScripts]
 * @param {function} [options.logger]
 * @param {number} [options.maximumFileSizeToCacheInBytes]
 * @param {array} [options.navigateFallbackWhitelist]
 * @param {string} [options.replacePrefix]
 * @param {array} [options.runtimeCaching]
 * @param {array} [options.staticFileGlobs]
 * @param {string} [options.stripPrefix]
 * @param {string} [options.templateFilePath]
 * @param {boolean} [options.verbose]
 *
 * // plugin options:
 * @param {string} [options.filename] - Service worker filename, default is 'service-worker.js'
 * @param {string} [options.filepath] - Service worker path and name, default is to use webpack.output.path + options.filename
 */

var SWPrecacheWebpackPlugin = function () {
  function SWPrecacheWebpackPlugin(options) {
    _classCallCheck(this, SWPrecacheWebpackPlugin);

    this.options = _extends({}, DEFAULT_OPTIONS, options);
  }

  _createClass(SWPrecacheWebpackPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('done', function (stats) {

        // get the output path specified in webpack config
        var outputPath = compiler.options.output.path || DEFAULT_OUTPUT_PATH;

        // get all assets outputted by webpack
        var assetGlobs = getAssetGlobs(stats.compilation).map(function (f) {
          return _path2.default.join(outputPath, f);
        });

        var ignorePatterns = _this.options.staticFileGlobsIgnorePatterns || [];

        // filter staticFileGlobs from ignorePatterns
        var staticFileGlobs = assetGlobs.filter(function (text) {
          return !ignorePatterns.some(function (regex) {
            return regex.test(text);
          });
        });

        var config = {
          staticFileGlobs: staticFileGlobs,
          verbose: true
        };

        if (outputPath) {
          // strip the webpack config's output.path
          config.stripPrefix = outputPath + '/';
        }

        if (compiler.options.output.publicPath) {
          // prepend the public path to the resources
          config.replacePrefix = compiler.options.output.publicPath;
        }

        _this.writeServiceWorker(compiler, config);
      });
    }
  }, {
    key: 'writeServiceWorker',
    value: function writeServiceWorker(compiler, config) {
      var fileDir = compiler.options.output.path || DEFAULT_OUTPUT_PATH,

      // default to options.filepath for writing service worker location
      filepath = this.options.filepath || _path2.default.join(fileDir, this.options.filename),
          workerOptions = _extends({}, config, this.options);

      return (0, _del2.default)(filepath).then(function () {
        return _swPrecache2.default.write(filepath, workerOptions);
      });
    }
  }]);

  return SWPrecacheWebpackPlugin;
}();

function getAssetGlobs(compilation) {
  var assets = [];
  for (var asset in compilation.assets) {
    assets.push(asset);
  }
  return assets;
}

module.exports = SWPrecacheWebpackPlugin;