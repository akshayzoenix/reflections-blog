const slugify = require("slugify");

module.exports = function(collectionApi) {
  let tagSlugMap = {};
  
  // Get all tags from posts (excluding drafts)
  collectionApi.getFilteredByGlob("posts/*.md")
    .filter(post => !post.data.draft && post.data.tags)
    .forEach(post => {
      post.data.tags.forEach(tag => {
        const slug = slugify(tag, { lower: true, strict: true });
        tagSlugMap[slug] = tag; // Map slug to original tag
      });
    });
  
  return tagSlugMap;
};
