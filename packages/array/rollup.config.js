import { nodeResolve } from '@rollup/plugin-node-resolve'

import pkg from './package.json'

const minifiedOutputs = [
  {
    file: pkg.exports['.'].import,
    format: 'esm',
  },
  {
    file: pkg.exports['.'].require,
    format: 'cjs',
  },
];

const unminifiedOutputs = minifiedOutputs.map(({ file, ...rest }) => ({
  ...rest,
  file: file.replace('.min.', '.'),
}))

const commonPlugins = [
  ts({
    transpiler: 'babel',
    babelConfig: '../..', // TODO: Use `{ rootMode: 'upward' }` instead
  }),
]

export default [
  {
    input: './src/index.ts',
    output: [...unminifiedOutputs, ...minifiedOutputs],
    plugins: [
      ...commonPlugins,
      resolve(),
      terser({ include: /\.min\.[^.]+$/ }),
    ],
    external: [/^@babel\/runtime\//],
  },
  {
    input: './src/server.ts',
    output: {
      file: pkg.exports['./server'],
      format: 'cjs',
    },
    plugins: commonPlugins,
  },
]

const config = {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'commonjs',
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      browser: true,
      extensions: ['.js', '.jsx'],
      preferBuiltins: false,
      modulesOnly: true,
      // Force resolving for these modules to root's node_modules that helps
      // to prevent bundling the same package multiple times if package is
      // imported from dependencies.
      dedupe: [ 'react', 'react-dom' ],
    }),
  ],
}

export default config
