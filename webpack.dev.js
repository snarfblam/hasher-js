var webpack = require('webpack');
var config = require('./webpack.config');
    
config.mode = 'development';
config.devtool = 'inline-source-map';

module.exports = config;
// module.exports = {
//     // mode: 'production',
//     // mode: 'development',
//     entry: './src/index.js',
//     stats: 'normal',
//     output: {
//         path: path.resolve(__dirname, "dist"),
//         libraryTarget: 'var',
//         library: 'Hasher',
//         filename: "hasher.js",
//     },
//     // devtool: 'source-map',
//     module: {
//         rules: [
//             // {
//             //     test: /\.tsx?$/,
//             //     loaders: ['babel-loader', 'ts-loader?' + JSON.stringify({
//             //         presets: ["es2015", { "modules": false }]
//             //     })],
//             //     'exclude': [/node_modules/],
//             //     // query: {
//             //     //     presets: ["es2015", { "modules": false }]
//             //     // }
//             // },
//             {
//                 test: /\.js$/,
//                 loader: 'babel-loader',
//                 query: {
//                     presets: ['es2015']
//                 }
//             }

//         ]
//     },
//     node: {
//         Buffer: false,
//     },
//     plugins: [
//         new webpack.LoaderOptionsPlugin({
//           debug: true
//         })
//     ]
// };