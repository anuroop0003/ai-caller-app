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
          throw new Error(`[withSherpaModels] Required model file missing: ${source}`);
        }
      }

      fs.mkdirSync(targetDir, { recursive: true });

      for (const file of files) {
        fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
      }

      // Also copy TTS model if present
      const ttsSourceDir = path.join(sourceDir, 'vits-piper-ml_IN-meera-medium');
      const ttsTargetDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets',
        'models',
        'vits-piper-ml_IN-meera-medium'
      );

      if (fs.existsSync(ttsSourceDir)) {
        fs.mkdirSync(ttsTargetDir, { recursive: true });
        fs.cpSync(ttsSourceDir, ttsTargetDir, { recursive: true });
      }

      return config;
    },
  ]);
};

module.exports = withSherpaModels;
