const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './test/test.js',
    stats: 'normal',
    output: {
        path: path.resolve(__dirname, "dist"),
        libraryTarget: 'var',
        library: 'hasherTest',
        filename: "hasherTest.js",
    },
    devtool: 'source-map',
    module: {
        rules: [
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