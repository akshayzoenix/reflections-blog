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

  // Filter: Unique tag list (forces some default tags to always appear)
  eleventyConfig.addFilter("tagList", function(collections) {
    const tagSet = new Set([
      "Philosophy",
      "Reflections",
      "Shayari",
      "Cosmology"
    ]);
    collections.posts.forEach(post => {
      if ("tags" in post.data) {
        post.data.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return [...tagSet];
  });

  // Collection: All non-draft posts, newest first
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse();
  });

  // Collection: Group non-draft posts by tag
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
