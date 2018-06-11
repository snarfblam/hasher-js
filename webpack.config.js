module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        libraryTarget: 'var',
        library: 'hasher',
    },
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
    }
};