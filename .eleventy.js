module.exports = function(eleventyConfig) {
  // Enable deep merge for data (makes layout and other settings merge properly)
  eleventyConfig.setDataDeepMerge(true);

  // Passthrough static files
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("admin/config.yml"); // ensure Netlify CMS config is copied
  eleventyConfig.addPassthroughCopy("images");

  // Date filter for formatting dates nicely
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

  // Posts collection - grabs all markdown files in posts/
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md").reverse();
  });

  // Auto-assign layout for posts
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
      input: ".",         // project root
      includes: "_includes",  // templates directory
      output: "_site"         // build output
    }
  };
};
