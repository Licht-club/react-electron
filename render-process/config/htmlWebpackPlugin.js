const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

function htmlWebpackPlugin(mode,chunkName) {
    return new HtmlWebpackPlugin({
        template: path.join(__dirname, `../${chunkName}/index.html`),
        filename: `${chunkName}.html`,
        chunks: [chunkName]
    })
}

module.exports = {
    htmlWebpackPlugin
}
