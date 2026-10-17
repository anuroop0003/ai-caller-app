const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withSherpaModels = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const sourceDir = path.join(projectRoot, 'src', 'models');
      const targetDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets',
        'models',
        'sherpa-onnx-indic-conformer-ml'
      );

      const files = ['model.int8.onnx', 'tokens.txt'];

      // Fail early if a required model file is missing.
      for (const file of files) {
        const source = path.join(sourceDir, file);

        if (!fs.existsSync(source)) {
          throw new Error(
            `[withSherpaModels] Required model file missing: ${source}`
          );
        }
      }

      fs.mkdirSync(targetDir, { recursive: true });

      for (const file of files) {
        fs.copyFileSync(
          path.join(sourceDir, file),
          path.join(targetDir, file)
        );
      }

      return config;
    },
  ]);
};

module.exports = withSherpaModels;
