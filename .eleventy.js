const markdownIt = require("markdown-it"); // 1
const slugify = require("slugify");        // 2

module.exports = function(eleventyConfig) { // 4
  // Markdown-it setup                    // 5
  const mdOptions = {                    // 6
    html: true,                        // 7
    breaks: true,                      // 8
    linkify: true,                    // 9
  };                                 // 10
  eleventyConfig.setLibrary("md", markdownIt(mdOptions)); // 11

  // Passthrough files                 // 13
  eleventyConfig.addPassthroughCopy("styles.css");  // 14
  eleventyConfig.addPassthroughCopy("admin");       // 15
  eleventyConfig.addPassthroughCopy("images");      // 16

  // Date filter                      // 18
  eleventyConfig.addFilter("date", (dateObj) => {   // 19
    if (!(dateObj instanceof Date)) {               // 20
      dateObj = new Date(dateObj);                   // 21
    }                                                // 22
    return dateObj.toLocaleDateString("en-US", {   // 23
      year: "numeric",                               // 24
      month: "long",                                 // 25
      day: "numeric",                                // 26
    });                                              // 27
  });                                                // 28

  // Slugify filter                    // 30
  eleventyConfig.addFilter("slugify", function(str) { // 31
    return slugify(str, { lower: true, strict: true }); // 32
  });                                // 33

  // Collections                     // 35
  eleventyConfig.addCollection("posts", function(collectionApi) { // 36
    return collectionApi.getFilteredByGlob("posts/*.md")         // 37
      .filter(post => !post.data.draft)                          // 38
      .reverse();                                                // 39
  });                                                            // 40

  eleventyConfig.addCollection("tagMap", function(collectionApi) { // 42
    const tagMap = {};                                           // 43
    collectionApi.getFilteredByGlob("posts/*.md").forEach(post => { // 44
      if (!post.data.draft && post.data.tags) {                 // 45
        post.data.tags.forEach(tag => {                         // 46
          if (!tagMap[tag]) tagMap[tag] = [];                   // 47
          tagMap[tag].push(post);                                // 48
        });                                                     // 49
      }                                                        // 50
    });                                                        // 51
    return tagMap;                                            // 52
  });                                                        // 53

  // Computed layout                // 55
  eleventyConfig.addGlobalData("eleventyComputed", {       // 56
    layout: data => {                                        // 57
      if (data.page.inputPath && data.page.inputPath.includes("/posts/")) { // 58
        return "layouts/post.njk";                          // 59
      }                                                    // 60
      return data.layout || null;                           // 61
    }                                                      // 62
  });                                                      // 63

  // Return directories            // 65
  return {                                                 // 66
    dir: {                                                // 67
      input: ".",                                         // 68
      includes: "_includes",                              // 69
      output: "_site"                                     // 70
    }                                                    // 71
  };                                                      // 72
};                                                        // 73
