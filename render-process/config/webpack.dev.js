const webpack = require('webpack')
const {
    merge
} = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const {htmlWebpackPlugin} = require('./htmlWebpackPlugin')
const mode = 'development'

module.exports = merge(common, {
    mode,
    devtool: 'inline-source-map',
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, "../dist"),
        historyApiFallback: {
            index: "./index.html",
        },
    },
    plugins: [
        htmlWebpackPlugin(mode,'main'),
        htmlWebpackPlugin(mode,'control'),
        new webpack.HotModuleReplacementPlugin()
    ],
})
