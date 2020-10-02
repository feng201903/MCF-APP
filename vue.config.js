const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  publicPath: "./",
  productionSourceMap: false,
  configureWebpack: {
    externals: {
      nacl_factory: "js-nacl"
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              warnings: false,
              drop_debugger: true,
              drop_console: true,
              pure_funcs: ["console.log"]
            }
          }
        })
      ]
    }
  }
};
