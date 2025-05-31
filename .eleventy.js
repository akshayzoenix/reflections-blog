const markdownIt = require("markdown-it");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true,
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
    return collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse();
  });

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

  // Build tagSlugMap **as a collection** instead of global data for easier access
  eleventyConfig.addCollection("tagSlugMap", function(collectionApi) {
    const tagMap = collectionApi.getAll()[0]?.data.tagMap || {};
    // But this is not reliable because tagMap is custom, so instead:
    // We'll build it manually from tagMap collection:
    const tagMapCollection = eleventyConfig.javascriptFunctions.collections.tagMap || {};
    // That might still be undefined, so better build fresh:
    let tagMapSafe = {};
    collectionApi.getFilteredByGlob("posts/*.md").forEach(post => {
      if (!post.data.draft && post.data.tags) {
        post.data.tags.forEach(tag => {
          if (!tagMapSafe[tag]) tagMapSafe[tag] = [];
          tagMapSafe[tag].push(post);
        });
      }
    });
    const map = {};
    Object.keys(tagMapSafe).forEach(tag => {
      map[slugify(tag, { lower: true, strict: true })] = tag;
    });
    return [map]; // Must return an array for collections
  });

  // Alternative way: Use eleventyComputed to build tagSlugMap once per page:
  eleventyConfig.addGlobalData("eleventyComputed", {
    tagSlugMap: data => {
      const slugify = require("slugify");
      const tagMap = data.tagMap || {};
      const map = {};
      Object.keys(tagMap).forEach(tag => {
        map[slugify(tag, { lower: true, strict: true })] = tag;
      });
      return map;
    }
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
