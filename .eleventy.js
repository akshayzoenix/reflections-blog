const markdownIt = require("markdown-it");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {
  // Markdown setup
  const mdOptions = { html: true, breaks: true, linkify: true };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  // Pass through static assets
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // Date filter
  eleventyConfig.addFilter("date", (dateObj) => {
    if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
    return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  // Slugify filter (for use in templates)
  eleventyConfig.addFilter("slugify", (str) => slugify(str, { lower: true, strict: true }));

  // Posts collection (no drafts, newest first)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse();
  });

  // tagMap collection: { tagName: [posts...] }
  eleventyConfig.addCollection("tagMap", function(collectionApi) {
    let tagMap = {};
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

  // tagSlugMap collection: { slugifiedTag: originalTag }
  eleventyConfig.addCollection("tagSlugMap", function(collectionApi) {
    let tagSlugMap = {};
    collectionApi.getFilteredByGlob("posts/*.md").forEach(post => {
      if (post.data.tags) {
        post.data.tags.forEach(tag => {
          tagSlugMap[slugify(tag, { lower: true, strict: true })] = tag;
        });
      }
    });
    return tagSlugMap;
  });

  // Dynamic layout for posts
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
