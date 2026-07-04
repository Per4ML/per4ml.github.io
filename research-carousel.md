Build a responsive horizontal auto-scrolling project carousel for my website.

Goal:
I have many research/projects, and I want them displayed as cards that continuously scroll from left to right or right to left, like a smooth marquee. The visitor should be able to quickly see the breadth of projects without manually clicking through everything.

Requirements:
1. Create reusable project cards with:
   - project title
   - short 1–2 sentence description
   - tags/keywords
   - optional image or icon
   - optional link button

2. The carousel should:
   - auto-scroll smoothly in a continuous loop
   - pause when the user hovers over it
   - allow manual horizontal scrolling with trackpad/mouse
   - work well on desktop, tablet, and mobile
   - avoid jerky jumps when the loop restarts
   - respect accessibility preferences, especially `prefers-reduced-motion`

3. Design:
   - clean academic/research website style
   - card-based layout
   - readable typography
   - subtle shadow or border
   - not too flashy
   - should make the projects look organized and impressive

4. Data:
   - Store project information in a separate JSON or JavaScript array so I can easily add new projects later.
   - Do not hard-code every project directly into the HTML if avoidable.

5. Implementation:
   - Use the existing website structure and styling conventions.
   - If my site uses plain HTML/CSS/JS, implement it without adding a large framework.
   - If my site uses React/Next.js, make it a reusable component.
   - Add comments explaining where I should edit project titles, descriptions, tags, and links.

Please inspect the current website code first, identify the correct page/component where this should be added, then implement the carousel cleanly.
