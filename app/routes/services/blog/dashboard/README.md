# Blog dashboard

This is the page where posts are listed. Clicking through posts will navigate to
editor of a single post.

# Structure

To make the dashboard preview what will be rendered, it uses component from the
web.

## Context

1. Post Server
2. Editor
3. Post edited
4. If post changes
5. Taxonomies

## Layout

1. Display blog-level navigation ui
2. Load tags and categories

## Blog

1. Display posts
2. Filter posts

## Post

```tsx
const ThisIsPostEditPage = () => {
	return (
		// Context includes POST (title, content, slug...), TAGS, CATEGORIES, EDITOR
		<Context>
			{/* PostComponent is from web/blog/components/post */}
			<PostComponent></PostComponent>
			{/* PostEditorSidebar is from dashboard/blog/components/post */}
			<PostEditorSidebar></PostEditorSidebar>
		</Context>
	)
}
```
