const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Configure markdown-it with automatic line breaks and HTML support
  const mdOptions = {
    html: true,        // Allow raw HTML in Markdown files
    breaks: true,      // Convert single newlines into <br> tags
    linkify: true      // Auto-link URLs in text
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  // Copy static files directly to the output folder
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // Custom date filter for formatting post dates
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

  // Filter: Unique tag list (used for the tags page)
  eleventyConfig.addFilter("tagList", function(collections) {
    const tagSet = new Set();
    collections.posts.forEach(post => {
      if ("tags" in post.data) {
        post.data.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return [...tagSet];
  });

  // Define the 'posts' collection, excluding drafts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft) // Exclude draft posts from live site
      .reverse();                       // Show newest posts first
  });

  // Collection: Group posts by tag (used to generate tag pages)
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

  // Dynamically set the layout for posts based on folder
  eleventyConfig.addGlobalData('eleventyComputed', {
    layout: data => {
      if (data.page.inputPath && data.page.inputPath.includes("/posts/")) {
        return "layouts/post.njk"; // Use the 'post' layout for posts
      }
      return data.layout || null;  // Use any explicitly set layout otherwise
    }
  });

  return {
    dir: {
      input: ".",            // Project root as input folder
      includes: "_includes", // Set _includes folder for layouts/partials
      output: "_site"        // Output build folder
    }
  };
};


