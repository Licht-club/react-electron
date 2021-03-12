const webpack = require('webpack')
const path = require('path');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const notifier = require('node-notifier')
const icon = path.join(__dirname, 'Error.png')
const SpeedMeasureWebpack5Plugin = require('speed-measure-webpack5-plugin')
const smp = new SpeedMeasureWebpack5Plugin()
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgeCssWebpackPlugin = require('purgecss-webpack-plugin')
const glob = require('glob')

const isProduction = process.env.NODE_ENV == 'production'

module.exports = {
    entry: {
        // 默认是main
        main: './render-process/main/index',
        control:'./render-process/control/index'
    },
    // 上下文目录,根目录 https://webpack.docschina.org/configuration/entry-context/#context
    context: process.cwd(),
    output: {
        filename: "[name].[hash].js",
        path: path.join(__dirname, "../dist-main"),
    },
    target: "electron-renderer",
    resolve: {
        // 引入的默认后缀名,一个个找
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        alias: {
            'bootstrap': path.resolve(process.cwd(), 'node_modules/bootstrap/dist/css/bootstrap.css')
        },
    },
    module: {
        rules: [
            {
                oneOf: [{
                    test: /\.tsx?$/,
                    // 排除node_modules,exclude优先级高于include,所以应尽可能使用include
                    // exclude: /node_modules/,
                    include: path.resolve(__dirname, '../'),
                    use: [
                        "cache-loader",
                        "ts-loader"
                    ],
                },
                    {
                        test: /\.css$/,
                        use: [
                            // 'cache-loader',
                            // ,
                            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                            'css-loader'
                        ]
                    }
                ]
            }
        ],
    },
    plugins: [
        // https://www.npmjs.com/package/friendly-errors-webpack-plugin
        new FriendlyErrorsWebpackPlugin({
            onErrors: (severity, errors) => {
                console.log(errors, 'errorserrorserrorserrorserrors')
                const error = errors[0]
                notifier.notify({
                    title: 'webpack编译失败',
                    message: severity + ": " + error.name,
                    subtitle: error.file || '',
                    icon,
                })
            }
        }),
        // https://www.npmjs.com/package/webpack-bundle-analyzer
        new BundleAnalyzerPlugin({
            analyzerMode: 'disable', // 不启动展示打包报告的web服务器
            generateStatsFile: true, // 生成报告文件
        }),
        // https://webpack.docschina.org/plugins/ignore-plugin/
        // new webpack.IgnorePlugin({
        //     resourceRegExp: /^\.\/locale$/,
        //     contextRegExp: /moment$/,
        // }),
        new MiniCssExtractPlugin(
            {filename: '[name].[hash:6].css',}
        ),
        new PurgeCssWebpackPlugin(
            {
                // 净化这个目录下所有文件
                paths: glob.sync(`${path.resolve(__dirname, '../main')}/**/*`, {nodir: true})
            }
        ),
    ],
}


