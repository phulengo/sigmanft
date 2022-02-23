module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
		// Minify CSS for production
		...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
	},
};
