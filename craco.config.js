const path = require('path');
module.exports = {
	webpack: {
		configure: (webpackConfig) => {

			webpackConfig.resolve.fallback = {
				path : require.resolve("path-browserify")
			};

			// webpackConfig.plugins.push(
			// 	new webpack.ProvidePlugin({
			// 		process: "process",
			// 		Buffer: ["buffer", "Buffer"],
			// 	})
			// );
			return webpackConfig;
		},
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},

	eslint: {
		configure: ( eslintConfig, { env, paths } ) => {

			// eslintConfig.rules = {
			// 	"react-hooks/rules-of-hooks" : "warn", // Checks rules of Hooks
			// 	"react-hooks/exhaustive-deps" : "warn" // Checks effect dependencies
			// };

			return eslintConfig;
		}
	},
};