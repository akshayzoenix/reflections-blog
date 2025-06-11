const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // --- Markdown Configuration ---
  const mdOptions = {
    html: true,
    breaks: true,
    linkify: true
  };
  eleventyConfig.setLibrary("md", markdownIt(mdOptions));

  // --- Passthrough Copy (Netlify CMS) ---
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // --- Filter: Format Date ---
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

  // --- Filter: Slugify (for URLs) ---
  eleventyConfig.addFilter("slugify", str =>
    str.toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  );

  // --- Filter: Titlecase (for display) ---
  eleventyConfig.addFilter("titlecase", str =>
    str.toString()
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );

  // --- Collection: All non-draft posts, newest first ---
  eleventyConfig.addCollection("posts", collectionApi =>
    collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse()
  );

  // --- Collection: Group posts by tag (raw, normalized keys) ---
  eleventyConfig.addCollection("tagMap", collectionApi => {
    let map = {};
    collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft && Array.isArray(post.data.tags))
      .forEach(post => {
        post.data.tags.forEach(rawTag => {
          // Normalize key (lowercase), display titlecase
          let key = rawTag.toString().toLowerCase();
          let display = key.charAt(0).toUpperCase() + key.slice(1);
          if (!map[display]) map[display] = [];
          map[display].push(post);
        });
      });
    return map;
  });

  // --- Collection: Unique tag list (from tagMap keys) ---
  eleventyConfig.addCollection("tagList", collectionApi => {
    let tags = new Set(Object.keys(collectionApi.getCollection("tagMap")));
    return [...tags];
  });

  // --- Auto-layout switcher based on input path ---
  eleventyConfig.addGlobalData("eleventyComputed", {
    layout: data => {
      if (data.page && data.page.inputPath && data.page.inputPath.includes("/posts/")) {
        return "layouts/post.njk";
      }
      return data.layout || null;
    }
  });

  // --- Return Directory Settings ---
  return {
    dir: {
      input: ".",            // Project root
      includes: "_includes", // Layouts & partials
      output: "_site"        // Build folder
    }
  };
};
