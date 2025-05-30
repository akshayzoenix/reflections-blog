const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Configure markdown-it with breaks enabled for automatic line breaks
  const mdOptions = {
    html: true,
    breaks: true,  // Enable hard line breaks on single newlines
    linkify: true
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

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
        return "layouts/post.njk"; // because includes root is "_includes"
      }
      return data.layout || null;
    }
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",  // set includes root here
      output: "_site"
    }
  };
};
