const webpack = require('webpack')
const path = require('path');

module.exports = {
    entry: './render-process/main/index',
    output: {
        filename: "[name].[hash].js",
        path: path.join(__dirname, "../dist-main"),
    },
    target: "electron-renderer",
    resolve: {
        // 引入的默认后缀名,一个个找
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        alias: {
            //   "@": path.resolve("src"), // 这样配置后 @ 可以指向 src 目录
        },
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
        }],
    },
    plugins: [],
}
