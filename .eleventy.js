const markdownIt = require("markdown-it");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {
  // Configure markdown-it with automatic line breaks and HTML support
  const mdOptions = {
    html: true,        // Allow raw HTML in Markdown files
    breaks: true,      // Convert single newlines into <br> tags
    linkify: true      // Auto-link URLs in text
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  // Passthrough copies
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

  // Unique tag list filter
  eleventyConfig.addFilter("tagList", function(collections) {
    const tagSet = new Set();
    collections.posts.forEach(post => {
      if ("tags" in post.data) {
        post.data.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return [...tagSet];
  });

  // Add slugify filter (use in Nunjucks templates)
  eleventyConfig.addFilter("slugify", (str) => {
    return slugify(str, { lower: true, strict: true });
  });

  // Define the 'posts' collection, excluding drafts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse();
  });

  // Collection: Group posts by tag
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

  // Add global data 'tagSlugMap' for mapping slug => original tag
  eleventyConfig.addGlobalData("tagSlugMap", (data) => {
    const collections = data.collections;
    let tagSlugMap = {};
    if (!collections || !collections.posts) return tagSlugMap;

    collections.posts.forEach(post => {
      if (post.data.tags) {
        post.data.tags.forEach(tag => {
          tagSlugMap[slugify(tag, { lower: true, strict: true })] = tag;
        });
      }
    });
    return tagSlugMap;
  });

  // Dynamically set layout for posts
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
