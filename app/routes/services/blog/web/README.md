# Blog

Display posts with status "PUBLISHED".

## Query Logic

### Posts

- General Posts

  Select all from post. Should limit if over 50 posts.

- Filter by title / category / tag

  Join post with **author**, **seo** tables and **post-tag / post-category**
  join tables, select post with **author, seo, tags, categories**.

### Post

Query by slug, with `LAG`(-1), `LEAD`(+1), order by created_at

## Cache

If not entered directly to specific post, data will query and cached in the
`layout.tsx`, navigating through posts without new query.

Filter query result will be cached and indexed in form
`category1,category2-tag1,tag2`.
