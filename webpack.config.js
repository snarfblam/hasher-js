module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        libraryTarget: 'var',
        library: 'hasher',
    }
};