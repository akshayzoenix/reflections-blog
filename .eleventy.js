const markdownIt = require("markdown-it");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {
  // Markdown setup
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }));

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

  // Slugify filter
  eleventyConfig.addFilter("slugify", function(str) {
    return slugify(str, { lower: true, strict: true });
  });

  // NEW: tagList filter (fixing your Netlify build issue)
  eleventyConfig.addFilter("tagList", function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      if ("tags" in item.data) {
        let tags = item.data.tags;
        if (typeof tags === "string") {
          tags = [tags];
        }
        tags.forEach(tag => tagSet.add(tag));
      }
    });
    return [...tagSet];
  });

  // Posts collection
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse();
  });

  // Unique tags collection
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set();
    collectionApi.getFilteredByGlob("posts/*.md").forEach(post => {
      if ("tags" in post.data) {
        post.data.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return [...tagSet];
  });

  // Tag-to-post mapping collection
  eleventyConfig.addCollection("tagMap", function(collectionApi) {
    let tagMap = {};
    collectionApi.getFilteredByG
