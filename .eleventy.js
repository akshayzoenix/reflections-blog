const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // 1. Markdown
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }));

  // 2. Passthrough Copy
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
  eleventyConfig.addFilter("titlecase", str =>
    str.toString().toLowerCase()
      .split(' ')
      .map(w => w[0].toUpperCase()+w.slice(1))
      .join(' ')
  );
  eleventyConfig.addFilter("stripHtml", value =>
    (value||"").replace(/<[^>]+>/g, "").replace(/\s+/g," ").trim()
  );
  eleventyConfig.addFilter("truncate", (value, length=150) => {
    if(!value) return "";
    let s = value.slice(0,length);
    return (value.length>length)? s+"…": s;
  });

  // 4. Collections
  // 4.1 All non-draft posts
  eleventyConfig.addCollection("posts", c =>
    c.getFilteredByGlob("posts/*.md")
     .filter(p => !p.data.draft)
     .reverse()
  );

  // 4.2 Group posts by tag
  eleventyConfig.addCollection("tagMap", c => {
    let map = {};
    c.getFilteredByGlob("posts/*.md")
     .filter(p => !p.data.draft && Array.isArray(p.data.tags))
     .forEach(p => {
       p.data.tags.forEach(raw => {
         let key = raw.toString().toLowerCase();
         let display = key[0].toUpperCase() + key.slice(1);
         (map[display] = map[display]||[]).push(p);
       });
     });
    return map;
  });

  // 4.3 Unique tag list
  eleventyConfig.addCollection("tagList", c => {
    let set = new Set();
    c.getFilteredByGlob("posts/*.md")
     .filter(p => !p.data.draft && Array.isArray(p.data.tags))
     .forEach(p => {
       p.data.tags.forEach(raw => {
         let key = raw.toString().toLowerCase();
         let display = key[0].toUpperCase() + key.slice(1);
         set.add(display);
       });
     });
    return [...set];
  });

  // 5. Auto-layout for posts
  eleventyConfig.addGlobalData("eleventyComputed", {
    layout: data =>
      data.page.inputPath.includes("/posts/")
        ? "layouts/post.njk"
        : data.layout || "layouts/base.njk"
  });

  // 6. Return dirs
  return {
    dir: { input: ".", includes: "_includes", output: "_site" }
  };
};
