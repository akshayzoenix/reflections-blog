const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  eleventyConfig.setLibrary("md", markdownIt({ html: true }));

  eleventyConfig.addFilter("date", (dateObj) => {
    if (!(dateObj instanceof Date)) {
      dateObj = new Date(dateObj);
    }
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md").reverse();
  });

  eleventyConfig.addGlobalData('eleventyComputed', {
    layout: data => {
      if (data.page.inputPath && data.page.inputPath.includes("/posts/")) {
        return "layouts/post.njk";
      }
      return data.layout || null;
    }
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};
