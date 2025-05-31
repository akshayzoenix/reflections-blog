const markdownIt = require("markdown-it");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {
  // Markdown-it setup
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true,
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  // Passthrough files
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // Date filter
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

  // Slugify filter for templates
  eleventyConfig.addFilter("slugify", function(str) {
    return slugify(str, { lower: true, strict: true });
  });

  // Collections
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse();
  });

  eleventyConfig.addCollection("tagMap", function(collectionApi) {
    const tagMap = {};
    collectionApi.getFilteredByGlob("posts/*.md").forEach(post => {
      if (!post.data.draft && post.data.tags) {
        post.data.tags.forEach(tag => {
          if (!tagMap[tag]) tagMap[tag] = [];
          tagMap[tag].push(post);
        });
      }
    });
    return tagMap;
  });

  // Computed layout for posts
  eleventyConfig.addGlobalData("eleventyComputed", {
    layout: data => {
      if (data.page.inputPath && data.page.inputPath.includes("/posts/")) {
        return "layouts/post.njk";
      }
      return data.layout || null;
    }
  });

  // Return directories
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};
