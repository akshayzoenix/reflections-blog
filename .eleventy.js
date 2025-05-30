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

  // Add a custom date filter for formatting post dates
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

  // Define the 'posts' collection, excluding drafts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft) // Exclude draft posts from live site
      .reverse();                       // Show newest posts first
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
