Modify the Recent Updates / News section.

Goals:
1. Make the Recent Updates section use the same visual/content width as the section directly above it, especially the Active Projects carousel container.
2. Do not let the news timeline become a giant vertical list.
3. Show only 10 news items at a time.
4. Add pagination controls so visitors can move to the previous or next 10 items.
5. Use left and right arrow buttons for pagination.
6. Keep the existing warm beige style, rounded cards, typography, tags, and timeline feel.

Implementation requirements:
- First inspect the existing Recent Updates component, data source, and CSS.
- Identify the max-width used by the section above, then reuse that exact width variable/class/style.
- If no shared width exists, create a reusable container class such as `.section-container` and apply it to both sections if safe.
- Preserve all existing news data.
- Do not remove old news items from the data file.
- Sort/order news exactly as currently intended.
- Render only the current page of 10 items.
- Add state for the current page.
- Add Previous and Next arrow buttons.
- Disable Previous on the first page.
- Disable Next on the last page.
- Show a small page indicator, for example: `1–10 of 100`.
- Make controls keyboard accessible and screen-reader friendly.
- Do not add a new dependency unless absolutely necessary.

Recommended layout:
- Keep the section header centered.
- Put the news list inside a container matching the Active Projects carousel width.
- Place pagination controls either:
  Option A: top-right above the news cards, or
  Option B: centered below the 10 visible news items.
- I prefer Option B unless it looks awkward.

Image handling recommendation:
If a news item has an image, show it as a small thumbnail inside the news card, not as a giant image.
Use this layout:
- thumbnail on the left, about 96px wide by 72px tall on desktop
- text content on the right
- image should use object-fit: cover
- rounded corners
- on mobile, stack image above text if needed
- if no image exists, keep the current text-only layout
- preserve alt text if available; otherwise use the news title as fallback alt text

Suggested component logic:
const ITEMS_PER_PAGE = 10;
const [page, setPage] = useState(0);

const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);
const visibleItems = newsItems.slice(
  page * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
);

Previous button:
setPage((p) => Math.max(0, p - 1))

Next button:
setPage((p) => Math.min(totalPages - 1, p + 1))

Acceptance criteria:
- The Recent Updates section width visually matches the section above.
- Only 10 news items are visible at once.
- Users can page through news items using left/right arrow buttons.
- The page does not become extremely long when there are many news items.
- News items with images display clean thumbnails.
- The site builds successfully.

After making changes:
1. Run the build command.
2. Fix any errors.
3. Summarize which files changed and what was changed.
