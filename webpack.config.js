const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',
  entry: {
    content: path.resolve(__dirname, 'src/content.ts'),
    background: path.resolve(__dirname, 'src/background.ts')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.extension.json',
              transpileOnly: false, // Enable type checking
              compilerOptions: {
                module: 'es2020',
                target: 'es2020'
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.mjs'],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    },
    fallback: {
      fs: false,
      path: false,
      crypto: false
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: 'public', to: '.' },
        { from: 'src/styles', to: '.' },
        { 
          from: 'node_modules/pdfjs-dist/build/pdf.worker.mjs',
          to: 'pdf.worker.min.js'
        },
        { from: 'node_modules/pdfjs-dist/cmaps', to: 'cmaps' },
        { 
          from: 'node_modules/pdfjs-dist/standard_fonts',
          to: 'standard_fonts'
        }
      ]
    })
  ],
  optimization: {
    minimize: false // Disable minification for better debugging
  }
};