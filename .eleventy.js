const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // 1. Markdown with Markdown-It
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }));

  // 2. Passthrough Copy (for CMS, images, CSS)
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");

  // 3. Filters
  eleventyConfig.addFilter("date", dateObj => {
    if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  });
  eleventyConfig.addFilter("slugify", str =>
    str.toString().toLowerCase()
       .replace(/\s+/g, '-')
       .replace(/[^\w\-]+/g, '')
       .replace(/\-\-+/g, '-')
       .replace(/^-+/, '')
       .replace(/-+$/, '')
  );
  eleventyConfig.addFilter("stripHtml", value =>
    (value||"").replace(/<[^>]+>/g, "").replace(/\s+/g," ").trim()
  );
  eleventyConfig.addFilter("truncate", (value, length = 150) => {
    if (!value) return "";
    let s = value.slice(0, length);
    return (value.length > length) ? s + "…" : s;
  });

  // 4. Collections
  eleventyConfig.addCollection("posts", c =>
    c.getFilteredByGlob("posts/*.md")
     .filter(p => !p.data.draft)
     .reverse()
  );

  eleventyConfig.addCollection("tagMap", c => {
    let map = {};
    c.getFilteredByGlob("posts/*.md")
     .filter(p => !p.data.draft && Array.isArray(p.data.tags))
     .forEach(p => {
       p.data.tags.forEach(raw => {
         let key = raw.toString().toLowerCase();
         let display = key.charAt(0).toUpperCase() + key.slice(1);
         (map[display] = map[display]||[]).push(p);
       });
     });
    return map;
  });

  eleventyConfig.addCollection("tagList", c => {
    let set = new Set();
    c.getFilteredByGlob("posts/*.md")
     .filter(p => !p.data.draft && Array.isArray(p.data.tags))
     .forEach(p => {
       p.data.tags.forEach(raw => {
         let key = raw.toString().toLowerCase();
         let display = key.charAt(0).toUpperCase() + key.slice(1);
         set.add(display);
       });
     });
    return [...set];
  });

  // 5. No computed layout – rely on each page’s front-matter
  // 6. Directory settings
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};
