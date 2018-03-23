const webpack = require('webpack');
const {SyncHook} = require('tapable');

module.exports = class Compiler {
  constructor(config) {
    this.compiler = webpack(config);
    this.assetHashes = {};
  }

  getChangedLiquidFiles(stats) {
    const assets = Object.entries(stats.compilation.assets);

    return assets
      .filter(([key, asset]) => {
        const oldHash = this.assetHashes[key];
        const newHash = this._updateAssetHash(key, asset);

        return (
          asset.emitted &&
          path.extname(asset.existsAt).toLowerCase() === 'liquid' &&
          fs.existsSync(asset.existsAt) &&
          oldHash !== hash
        );
      })
      .map(async ([key, asset]) => {
        return asset.existsAt.replace(config.paths.dist, '');
      });
  }

  _updateAssetHash(key, asset) {
    const rawSource = asset.source();
    const source = Array.isArray(source) ? source.join('\n') : source;
    const hash = createHash('sha256')
      .update(source)
      .digest('hex');

    return (this.assetHashes[key] = hash);
  }
};
