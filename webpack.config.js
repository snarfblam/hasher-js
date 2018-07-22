module.exports = {
    mode: 'production',
    entry: './src/index.js',
    stats: 'normal',
    output: {
        libraryTarget: 'var',
        library: 'hasher',
    },
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
    }
};