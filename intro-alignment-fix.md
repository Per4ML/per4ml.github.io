Refine and rebalance the About the Lab section.

Current issue:
The section has too much vertical fragmentation. The multiple paragraphs, research-focus bullets, and metric cards create unnecessary visual weight and make the section feel disconnected. The goal is to make this read like a strong research identity statement with a cleaner and more balanced layout.

Make these changes:

1. Keep the title structure:

WHO WE ARE

# About the Lab

2. Merge the existing four body paragraphs into ONE cohesive paragraph.

The text should read continuously as a single research narrative rather than separate blocks.

Use this content as one paragraph:

"The Per4ML Laboratory develops cutting-edge AI and machine learning methods for modeling complex relationships among heterogeneous data objects spanning tables, text, graphs, trees, images, and count-based representations. Our research studies how diverse forms of information interact, align, and compose to reveal hidden structure that individual modalities alone cannot capture. We build representation learning and foundation-modeling approaches that transform these complex relationships into more time- and data-efficient predictive and generative systems. These models enable intelligent reasoning across tasks including prediction, generation, adaptation, and counterfactual decision-making while requiring fewer observations and less supervision. Beyond model development, we design end-to-end AI systems that operationalize these capabilities in real-world environments. Our work spans high-performance computing, healthcare, and emerging scientific applications where robust decision-making must occur under heterogeneous, noisy, and evolving conditions. From agentic systems to developing coding and performance-optimization skills, and from foundation models to interactive visualizations, we move fast and wide—building AI methods and systems that turn abstract ideas into usable intelligence."

3. Remove:
- Research Focus section
- star bullets
- 24 Publications card
- $4.6M+ Funding card
- Prediction + Generation + Decision Intelligence card
- HPC + Healthcare card

4. Replace everything below the paragraph with keyword tags.

Design:
- each keyword gets its own light rectangular pill
- use a slightly lighter cream/off-white background than page background
- soft border
- rounded corners
- compact padding
- subtle hover animation
- orange accent only for hover/details
- flex-wrap naturally into multiple rows
- maintain left alignment with body text
- preserve breathing room

Suggested tags:

Multimodal Representation Learning
Data-Efficient AI
Foundation Models
Heterogeneous Data
Graphs
Trees
Tables
Text
Images
Count Data
Prediction
Generation
Counterfactual Decision Making
Transfer Learning
Agentic Systems
Performance Optimization
HPC
Healthcare

Implementation:

display:flex;
flex-wrap:wrap;
gap:0.75rem;

The final result should feel like a research manifesto plus living topic map rather than a faculty profile page or metric dashboard.
