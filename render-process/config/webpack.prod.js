const webpack = require('webpack')
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {htmlWebpackPlugin} = require('./htmlWebpackPlugin')

const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

const mode = 'production'

module.exports = merge(common, {
    mode,
    devtool: false,
    // 优化选项 https://webpack.docschina.org/configuration/optimization/#root
    optimization: {
        // 开启最小化,默认是true
        minimize: true,
        minimizer: [new TerserPlugin({
            exclude: /nodu_modules/
        })],
        //
        splitChunks: {
            chunks: "all", //表明将选择哪些 chunk 进行优化,默认作用于异步chunk，值为all/initial/async
            minSize: 0, //默认值是30kb,代码块的最小尺寸
            minChunks: 1, //被多少模块共享,在分割之前模块的被引用次数
            maxAsyncRequests: 3, //限制异步模块内部的并行最大请求数的，说白了你可以理解为是每个import()它里面的最大并行请求数量
            maxInitialRequests: 5, //限制入口的拆分数量
        }
    },
    plugins: [
        // 打包时候才需要clear
        new CleanWebpackPlugin(),
        new OptimizeCssAssetsWebpackPlugin(),
        htmlWebpackPlugin(mode,'main'),
        htmlWebpackPlugin(mode,'control'),
    ]
})
