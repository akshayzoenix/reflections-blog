const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Markdown configuration
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  // Passthrough copies
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // Filter: Format date
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

  // Filter: Slugify strings for URLs
  eleventyConfig.addFilter("slugify", function(str) {
    return str
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  });

  // Collection: All non-draft posts, newest first
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse();
  });

  // Collection: Unique tag list (always includes these defaults)
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set([
      "Philosophy",
      "Reflections",
      "Shayari",
      "Cosmology"
    ]);
    collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft && post.data.tags)
      .forEach(post => {
        post.data.tags.forEach(tag => tagSet.add(tag));
      });
    return [...tagSet];
  });

  // Collection: Group non-draft posts by tag
  eleventyConfig.addCollection("tagMap", function(collectionApi) {
    let tagMap = {};
    collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft && post.data.tags)
      .forEach(post => {
        post.data.tags.forEach(tag => {
          if (!tagMap[tag]) tagMap[tag] = [];
          tagMap[tag].push(post);
        });
      });
    return tagMap;
  });

  // Auto-layout switcher based on folder path
  eleventyConfig.addGlobalData("eleventyComputed", {
    layout: data => {
      if (data.page && data.page.inputPath && data.page.inputPath.includes("/posts/")) {
        return "layouts/post.njk";
      }
      return data.layout || null;
    }
  });

  return {
    dir: {
      input: ".",            // Project root
      includes: "_includes", // Layouts and partials
      output: "_site"        // Build folder
    }
  };
};
