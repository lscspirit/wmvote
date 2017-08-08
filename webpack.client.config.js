"use strict";

import path from 'path';
import webpack from "webpack";

import ExtractTextPlugin from "extract-text-webpack-plugin";

const client_config = {
  entry: {
    client: ['babel-polyfill', path.join(__dirname, "client/app.js")]
  },
  output: {
    path: path.join(__dirname, "public/assets"),
    publicPath: "/assets",
    filename: "[name].js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".js.jsx"]
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: "babel-loader"
    }, {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        use: ["css-loader", "sass-loader"],
        fallback: "style-loader"
      })
    }]
  },
  // package third-party modules and the main app into two separate bundles
  plugins: [
    new ExtractTextPlugin("styles.css"),
    // https://webpack.js.org/guides/code-splitting-libraries/#implicit-common-vendor-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function(module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    }),
    // CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest' // But since there are no more common modules between them we end up with just the runtime code included in the manifest file
    })
  ]
};

export default client_config;