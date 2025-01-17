const sassdoc = require('sassdoc')
const paths = require('../config/paths.js')

function buildSassdocs () {
  return sassdoc([paths.src + '**/**/*.scss', `!${paths.src}/vendor/*`], {
    dest: paths.sassdoc,
    groups: {
      'components/button': 'Components / Button',
      'helpers/accessibility': 'Helpers / Accessibility',
      'helpers/colour': 'Helpers / Colour',
      'helpers/layout': 'Helpers / Layout',
      'helpers/links': 'Helpers / Links',
      'helpers/shapes': 'Helpers / Shapes',
      'helpers/spacing': 'Helpers / Spacing',
      'helpers/typography': 'Helpers / Typography',
      'settings/assets': 'Settings / Assets',
      'settings/colours': 'Settings / Colours',
      'settings/compatibility': 'Settings / Compatibility',
      'settings/global-styles': 'Settings / Global Styles',
      'settings/ie8': 'Settings / IE8',
      'settings/measurements': 'Settings / Measurements',
      'settings/media-queries': 'Settings / Media Queries',
      'settings/spacing': 'Settings / Spacing',
      'settings/typography': 'Settings / Typography',
      tools: 'Tools',
      helpers: 'Helpers',
      overrides: 'Overrides',
      objects: 'Objects',
      'objects/layout': 'Objects / Layout'
    }
  })
}

module.exports = buildSassdocs
