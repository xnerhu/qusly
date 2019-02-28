const { join } = require('path');
const { TypeChecker } = require('fuse-box-typechecker');
const {
  FuseBox,
  EnvPlugin,
  QuantumPlugin,
  JSONPlugin,
  Sparky,
  WebIndexPlugin,
} = require('fuse-box');

const production = process.env.NODE_ENV === 'prod';
const outputDir = 'build';

const testWatch = TypeChecker({
  tsConfig: './tsconfig.json',
  tsLint: './tslint.json',
  basePath: './',
  yellowOnLint: true,
  shortenFilenames: true,
});

if (!production) {
  testWatch.runWatch('./src/');
}

class Builder {
  constructor(
    config = {
      target: '',
      name: '',
      output: '',
      instructions: '',
      watch: '',
      watchFilter,
      runWhenCompleted: false,
      devServerOptions: {},
      plugins: [],
    },
  ) {
    const { target, name, output, plugins } = config;
    this.config = config;
    this.fuseConfig = Builder.getFuseConfig(target, name, output, plugins);
  }

  static getFuseConfig(target, name, output = '$name.js', plugins = []) {
    return {
      target,
      homeDir: 'src/',
      output: join(outputDir, output),
      tsConfig: './tsconfig.json',
      useTypescriptCompiler: true,
      sourceMaps: target !== 'server',
      cache: !production,
      plugins: [
        EnvPlugin({
          NODE_ENV: production ? 'production' : 'development',
        }),
        JSONPlugin(),
        production &&
          QuantumPlugin({
            bakeApiIntoBundle: name,
            treeshake: true,
            removeExportsInterop: false,
            uglify: {
              es6: true,
            },
          }),
      ].concat(plugins),
      alias: {
        '~': '~/',
      },
      log: {
        showBundledFiles: false,
      },
    };
  }

  async init() {
    const {
      name,
      target,
      instructions,
      watch,
      watchFilter,
      runWhenCompleted,
      devServerOptions,
    } = this.config;
    const fuse = FuseBox.init(this.fuseConfig);
    const app = fuse.bundle(name).instructions(instructions);

    if (!production) {
      app.watch(watch, watchFilter);

      if (target !== 'server') {
        fuse.dev(devServerOptions);
        app.hmr();
      } else if (runWhenCompleted) {
        app.completed(proc => proc.start());
      }
    }

    return await fuse.run();
  }
}

Sparky.task('default', ['renderer', 'main']);

Sparky.task('main', async () => {
  await new Builder({
    name: 'main',
    target: 'server',
    instructions: '> [main/index.ts]',
    watch: '[main/index.ts]',
  }).init();
});

Sparky.task('renderer', async () => {
  await new Builder({
    name: 'app',
    target: 'browser@es6',
    instructions: '> renderer/index.tsx',
    watch: 'renderer/**',
    devServerOptions: {
      httpServer: true,
    },
    plugins: [
      WebIndexPlugin({
        target: `index.html`,
        template: `src/renderer/resources/pages/index.html`,
        path: production ? '.' : '/',
      }),
    ],
  }).init();
});
