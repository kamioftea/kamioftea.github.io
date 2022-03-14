const { EleventyRenderPlugin } = require("@11ty/eleventy");
const feather = require('feather-icons');

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(EleventyRenderPlugin)

    // IntelliJ doesn't like frontmatter before <!doctype html> in root layout
    // So add the layout defaults here
    eleventyConfig.addGlobalData('title', 'Jeff Horton')
    eleventyConfig.addGlobalData('layout', 'layout.njk')

    eleventyConfig.addPassthroughCopy('assets')
    eleventyConfig.addPassthroughCopy('./favicon.png')

    eleventyConfig.addNunjucksFilter('icon', (name) => feather.icons[name].toSvg())

    return {
        passthroughFileCopy: true,
        markdownTemplateEngine: 'njk',
        pathPrefix: process.env.PATH_PREFIX ?? ''
    }
};
