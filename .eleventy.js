const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // --- 1. Markdown Configuration ---
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }));

  // --- 2. Passthrough Copy (Netlify CMS) ---
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // --- 3. Filters ---
  // 3.1. Format Date
  eleventyConfig.addFilter("date", dateObj => {
    if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  });

  // 3.2. Slugify for URLs
  eleventyConfig.addFilter("slugify", str =>
    str.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  );

  // 3.3. Titlecase for display
  eleventyConfig.addFilter("titlecase", str =>
    str.toString().toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );

  // 3.4. Strip HTML tags
  eleventyConfig.addFilter("stripHtml", value => {
    return (value || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  });

  // 3.5. Truncate text with ellipsis
  eleventyConfig.addFilter("truncate", (value, length = 150) => {
    if (!value) return "";
    let str = value.slice(0, length);
    return (value.length > length) ? (str + "…") : str;
  });

  // --- 4. Collections ---
  // 4.1. All non-draft posts, newest first
  eleventyConfig.addCollection("posts", collectionApi =>
    collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft)
      .reverse()
  );

  // 4.2. Group posts by normalized, Title-cased tag
  eleventyConfig.addCollection("tagMap", collectionApi => {
    let map = {};
    collectionApi.getFilteredByGlob("posts/*.md")
      .filter(post => !post.data.draft && Array.isArray(post.data.tags))
      .forEach(post => {
        post.data.tags.forEach(rawTag => {
          let key = rawTag.toString().toLowerCase();
          let display = key.charAt(0).toUpperCase() + key.slice(1);
          if (!map[display]) map[display] = [];
          map[display].push(post);
        });
      });
    return map;
  });

  // 4.3. Unique tag list (just the keys of tagMap)
  eleventyConfig.addCollection("tagList", collectionApi =>
    Object.keys(collectionApi.getCollection("tagMap"))
  );

  // --- 5. Auto-layout for posts vs pages ---
  eleventyConfig.addGlobalData("eleventyComputed", {
    layout: data =>
      data.page.inputPath.includes("/posts/")
        ? "layouts/post.njk"
        : data.layout || "layouts/base.njk"
  });

  // --- 6. Directory settings ---
  return {
    dir: {
      input: ".",            // Project root
      includes: "_includes", // Layouts & partials
      output: "_site"        // Build folder
    }
  };
};
