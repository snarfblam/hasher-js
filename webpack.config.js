var webpack = require('webpack');
const path = require('path');

module.exports = {
    // mode: 'production',
    mode: 'development', // overridden
    entry: './src/index.js',
    stats: 'normal',
    output: {
        path: path.resolve(__dirname, "dist"),
        libraryTarget: 'var',
        library: 'Hasher',
        filename: "hasher.js",
    },
    devtool: 'source-map',
    module: {
        rules: [
            // {
            //     test: /\.tsx?$/,
            //     loaders: ['babel-loader', 'ts-loader?' + JSON.stringify({
            //         presets: ["es2015", { "modules": false }]
            //     })],
            //     'exclude': [/node_modules/],
            //     // query: {
            //     //     presets: ["es2015", { "modules": false }]
            //     // }
            // },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }

        ]
    },
    node: {
        Buffer: false,
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
          debug: true
        })
    ]
};