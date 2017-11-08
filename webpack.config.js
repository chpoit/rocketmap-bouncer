const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
    context: path.normalize(__dirname),
    entry: {
        server: "./server.js",
        //signup: "./views/signup.html",
        //login: "./views/login.html",
    },
    target: 'node',
    node: {
        mssql: 'empty',
        'pg-hstore': 'empty',
        __dirname: true,
        __filename: false
    },
    output: {
        path: path.normalize(__dirname),
        filename: "dist/[name].js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.html$/, loader: "html-loader?file=[name].html" },
            { test: /\.json$/, loader: "json-loader" },
        ]
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     template: "./views/login.html"
        // }),
        // new HtmlWebpackPlugin({
        //     template: "./views/signup.html"
        // }),
        // new webpack.IgnorePlugin(/(pg)|(mssql)|(tedious)/)
    ]
};

module.exports = config;