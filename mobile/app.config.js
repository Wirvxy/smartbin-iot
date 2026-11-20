// Reads app.json. Set EXPO_BASE_URL to build the web version for a sub-path, e.g. the
// GitHub Pages demo:  EXPO_BASE_URL=/smartbin-iot/app npx expo export --platform web
module.exports = ({ config }) => ({
  ...config,
  web: {
    name: 'SmartBin',
    shortName: 'SmartBin',
    lang: 'fr',
    themeColor: '#17201b',
    backgroundColor: '#eceee9',
    ...config.web,
  },
  experiments: process.env.EXPO_BASE_URL
    ? { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL }
    : config.experiments,
});
