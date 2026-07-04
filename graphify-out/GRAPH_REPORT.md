# Graph Report - .  (2026-05-16)

## Corpus Check
- Large corpus: 87 files · ~968,957 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 228 nodes · 256 edges · 27 communities (15 shown, 12 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend Core & Layout|Frontend Core & Layout]]
- [[_COMMUNITY_Project Documentation & Metadata|Project Documentation & Metadata]]
- [[_COMMUNITY_Branding & Team Visuals|Branding & Team Visuals]]
- [[_COMMUNITY_Lab Identity & Members|Lab Identity & Members]]
- [[_COMMUNITY_Project Performance Artifacts|Project Performance Artifacts]]
- [[_COMMUNITY_Static Site Generator (mkhtml)|Static Site Generator (mkhtml)]]
- [[_COMMUNITY_BibTeX Processing Pipeline|BibTeX Processing Pipeline]]
- [[_COMMUNITY_News Management Scripts|News Management Scripts]]
- [[_COMMUNITY_Research Carousel UI|Research Carousel UI]]
- [[_COMMUNITY_HPC & Fault Tolerance Research|HPC & Fault Tolerance Research]]
- [[_COMMUNITY_Project Data Management|Project Data Management]]
- [[_COMMUNITY_Team Member UI|Team Member UI]]
- [[_COMMUNITY_Machine Learning Research|Machine Learning Research]]
- [[_COMMUNITY_Member Data Management|Member Data Management]]
- [[_COMMUNITY_Mindmap Data Pipeline|Mindmap Data Pipeline]]
- [[_COMMUNITY_Publication Mindmap UI|Publication Mindmap UI]]
- [[_COMMUNITY_About Page UI|About Page UI]]
- [[_COMMUNITY_Publication Data Management|Publication Data Management]]
- [[_COMMUNITY_Build Configuration (Vite)|Build Configuration (Vite)]]
- [[_COMMUNITY_Power Analysis Research|Power Analysis Research]]
- [[_COMMUNITY_Latency Analysis Research|Latency Analysis Research]]
- [[_COMMUNITY_Member: Banooqa & Nawshin|Member: Banooqa & Nawshin]]
- [[_COMMUNITY_Member: Avaneesh|Member: Avaneesh]]
- [[_COMMUNITY_Member: Chase|Member: Chase]]
- [[_COMMUNITY_Member: Ashna|Member: Ashna]]
- [[_COMMUNITY_Member: Elvis|Member: Elvis]]
- [[_COMMUNITY_Member: Ankur|Member: Ankur]]

## God Nodes (most connected - your core abstractions)
1. `Per4ML Laboratory — research group at Texas State University` - 23 edges
2. `public/llms.txt — AI crawler hints for Per4ML` - 10 edges
3. `PLAN.md — Per4ML website implementation plan` - 9 edges
4. `HTMLTemplate` - 7 edges
5. `Per4ML Logo PNG - Green stylized text logo reading 'PER4ML' with circuit board graphic, primary visual identity of the Per4ML research lab` - 7 edges
6. `PubParser` - 6 edges
7. `job1_publications()` - 5 edges
8. `main()` - 5 edges
9. `row_to_news_item()` - 5 edges
10. `update_news_json()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Papers Icon (papersico2)` --conceptually_related_to--> `Per4ML Laboratory — research group at Texas State University`  [INFERRED]
  images/papersico2.png → index.html
- `Courses Icon (courses2)` --conceptually_related_to--> `Per4ML Laboratory — research group at Texas State University`  [INFERRED]
  images/courses2.png → index.html
- `CS Education / Computer with Graduation Cap Icon` --conceptually_related_to--> `Per4ML Laboratory — research group at Texas State University`  [INFERRED]
  images/CSedico.png → index.html
- `Avatar / Robot Icon (avatar752)` --conceptually_related_to--> `Per4ML Laboratory — research group at Texas State University`  [INFERRED]
  images/avatar752.png → index.html
- `contents/blank.html — legacy static HTML template` --semantically_similar_to--> `public/blank.html — legacy static HTML template (public copy)`  [INFERRED] [semantically similar]
  contents/blank.html → public/blank.html

## Hyperedges (group relationships)
- **AI discoverability implemented via robots.txt + llms.txt + JSON-LD in index.html** — public_robots_txt, public_llms_txt, index_html [EXTRACTED 1.00]
- **Per4ML core research themes: few-shot learning, transfer learning, HPC performance modeling** — few_shot_learning, transfer_learning, hpc_performance_modeling [EXTRACTED 1.00]
- **bib2json.py pipeline produces publications.json, keywords_computed.json, stats.json consumed by React components** — bib2json_pipeline, keyword_wordcloud, per4ml_lab [EXTRACTED 0.95]
- **HPC Checkpoint and Recovery Systems: FALCON, FTA, and PhD Thesis all address fault tolerance and recovery overhead reduction in parallel applications** — falcon_recovery_overhead_chart, fta_mpi_recovery_diagram, phdthesis_recovery_overhead_chart [INFERRED 0.85]
- **Performance Counter Analysis Projects: DASHING, VERITAS, and CMTbone-comm all analyze hardware performance counters for HPC applications** — dashing_perf_counter_wheel, veritas_struct_diagram, cmtbone_comm_coverage_chart [INFERRED 0.85]
- **ML-driven HPC Performance Prediction: PING, PerfGen, and Comparative Code all apply machine learning to predict or model HPC application performance** — ping_graph_construction, perfgen_architecture, comparative_code_pipeline [INFERRED 0.85]
- **Ph.D. Team Members of Per4ML Lab** — team_mohzae, team_elvfef, team_ashahm, team_banban, team_anklah, team_chaphe, team_nawtan [EXTRACTED 1.00]
- **Per4ML Website Branding and Navigation Icons** — per4ml_png, per4ml_svg, papersico2_image, courses2_image, csedico_image [INFERRED 0.85]
- **Alumni Team Members of Per4ML Lab** — team_avaram, team_arudey, team_jaysra [EXTRACTED 1.00]
- **Per4ML website navigation icons - papersico2, courses2, avatar752, CSedico form the icon set for the Per4ML lab website navigation** — papersico2_icon, courses2_icon, avatar752_icon, csedico_icon [INFERRED 0.85]
- **Per4ML research lab member portraits - all member headshots belong to the same lab group led by Tanzima Islam** — member_tanzima, member_nirajan, member_arunavo, member_avaneesh, member_chase, member_yugesh, member_ashna, member_zaeed, member_nawshin, member_elvis, member_banooqa, member_ankur, member_jaya [INFERRED 0.95]
- **Per4ML branding assets - logo PNG, logo SVG, and site icons form the visual identity system of the Per4ML lab** — per4ml_logo_png, per4ml_logo_svg, papersico2_icon, courses2_icon, avatar752_icon, csedico_icon [INFERRED 0.85]

## Communities (27 total, 12 thin omitted)

### Frontend Core & Layout - "Frontend Core & Layout"
Cohesion: 0.06
Nodes (12): FUNDERS, HeroProps, NAV_LINKS, NavBarProps, DOT_COLORS, news, NewsEntry, allProjects (+4 more)

### Project Documentation & Metadata - "Project Documentation & Metadata"
Cohesion: 0.11
Nodes (26): AI Discoverability — first-class SEO requirement for AI crawlers, BibTeX → JSON build pipeline — content pipeline design, CLAUDE.md — Claude Code project instructions, COMPASS — adaptive HPC job scheduling via performance prediction, contents/blank.html — legacy static HTML template, Data-Efficient ML — research theme, Few-Shot Learning for HPC — research theme, GEMINI_API_KEY — environment variable for AI Studio integration (+18 more)

### Branding & Team Visuals - "Branding & Team Visuals"
Cohesion: 0.12
Nodes (19): Avatar / Robot Icon (avatar752), Courses Icon (courses2), CS Education / Computer with Graduation Cap Icon, Papers Icon (papersico2), Per4ML Laboratory — research group at Texas State University, Per4ML Logo (PNG) - green stylized text with circuit board motif, Per4ML Logo (SVG) - vector version of lab branding, Ankur Lahiri - Team Member (Ph.D.) (+11 more)

### Lab Identity & Members - "Lab Identity & Members"
Cohesion: 0.12
Nodes (18): Avatar/Team Icon (avatar752.png) - Green circular icon with robot/avatar figure, used as navigation icon for team/members section, Courses Icon (courses2.png) - Green circular icon with open book symbol, used as navigation icon for courses section, CS/Education Icon (CSedico.png) - Green circular icon with graduation cap on monitor/computer, representing CS education or courses, Avatar/Team Icon duplicate (images/avatar752.png) - Green circular robot/avatar icon, navigation icon for team/members section, Courses Icon duplicate (images/courses2.png) - Green circular open book icon, navigation icon for courses section, CS/Education Icon duplicate (images/CSedico.png) - Green circular graduation cap on computer icon, CS education icon, Papers Icon duplicate (images/papersico2.png) - Green circular icon with document/checklist symbol, navigation icon for publications, Per4ML Logo PNG duplicate (images/per4ml.png) - Green Per4ML logo with circuit board graphic, duplicate in images directory (+10 more)

### Project Performance Artifacts - "Project Performance Artifacts"
Cohesion: 0.15
Nodes (15): CMTbone vs CMTnek Comm Kernel: Coverage vs Resource Importance Scatter Plot, Hardware Resource Importance (PREFETCH, FP, BR, L1, L2, L3, TLB, MEM) for CMT kernels, DASHING: PLASMA-DGEMM Performance Counter Radial Analysis (IPC, Cache, TLB, Branch categories), PLASMA-DGEMM Kernel Performance Counter Analysis, FRACTAL: LLM-based Cross-Platform Performance Counter Translation Pipeline (Platform A -> Platform C -> Platform B), LLM Function g(C_A)->C_P for Hardware Performance Counter Translation Across Platforms, Relative Performance Prediction f(C_P)->T_B/P for Cross-Platform Benchmarking, CoMD Application Configuration Space (algorithm, bw_level, task_count, power_cap, thread_count) (+7 more)

### Static Site Generator (mkhtml) - "Static Site Generator (mkhtml)"
Cohesion: 0.23
Nodes (3): HTMLTemplate, nextfield(), PubParser

### BibTeX Processing Pipeline - "BibTeX Processing Pipeline"
Cohesion: 0.29
Nodes (11): clean_latex(), extract_award(), job1_publications(), job2_keywords(), job3_stats(), load_bib(), main(), Remove common LaTeX markup from a string. (+3 more)

### News Management Scripts - "News Management Scripts"
Cohesion: 0.36
Nodes (10): clean_html(), load_existing_news(), main(), make_news_key(), normalize_category(), parse_date(), Sort news.csv in place so the latest news appears at the very end., row_to_news_item() (+2 more)

### Research Carousel UI - "Research Carousel UI"
Cohesion: 0.2
Nodes (5): allProjects, arrowStyle, CloudWord, KeywordEntry, Project

### HPC & Fault Tolerance Research - "HPC & Fault Tolerance Research"
Cohesion: 0.24
Nodes (10): FALCON Erasure Coding for Checkpoint Recovery, Network Transfer and Disk Write Overhead in FALCON Checkpoint Recovery, FALCON: Recovery Overhead Comparison Chart - Falcon vs Dedicated Checkpoint at Various Checkpoint Sizes, FTA_COMM_WORLD: Fault-Tolerant MPI Communicator Abstraction, FTA: Fault Tolerant MPI Recovery Diagram - Shrinking vs Non-Shrinking Recovery with FTA_COMM_WORLD, Shrinking Recovery Mode in FTA (reduces process count after failure), ALE3D Benchmark Application, Cactus Benchmark Application (+2 more)

### Project Documentation & Metadata0 - "Project Documentation & Metadata0"
Cohesion: 0.29
Nodes (6): image_name_from_title(), infer_tags(), Convert title to URL-safe id:     'Few-Shot Transfer Learning for Performance', Creates image path:     PerfGen -> images/projects/perfgen.png, Extract rough tags from project title + description.      Extend this dictionary, slugify()

### Project Documentation & Metadata1 - "Project Documentation & Metadata1"
Cohesion: 0.29
Nodes (6): groupByLevel(), LEVEL_COLORS, LEVEL_ORDER, Member, members, Team()

### Project Documentation & Metadata2 - "Project Documentation & Metadata2"
Cohesion: 0.29
Nodes (8): Deep Representation Learning from AST (Node Rep -> Code Rep), Comparative Code Analysis Pipeline: Source Code -> ROSE AST -> Deep Representation Learning -> Neural Network Prediction, ROSE Compiler Framework for AST Generation, Supervised Learning Applications (Classification, Regression, Diagnostics), Machine Learning Taxonomy: Supervised, Unsupervised, Reinforcement Learning with Applications, Unsupervised Learning Applications (Clustering, Dimensionality Reduction, Recommender Systems), PerfGen System Architecture: User data -> Preprocessing -> Generative Model -> Conditional/Unconditional Samples, PerfGen Generative Model for Performance Data Synthesis

### Project Documentation & Metadata4 - "Project Documentation & Metadata4"
Cohesion: 0.4
Nodes (4): build_hierarchy(), parse_bibtex(), Builds a hierarchical JSON structure for the D3 mindmap.     Root -> Research Ar, A simple parser to extract publications from a BibTeX string.     In a real scen

### Project Documentation & Metadata6 - "Project Documentation & Metadata6"
Cohesion: 0.67
Nodes (3): About(), linkStyle, useCountUp()

## Knowledge Gaps
- **84 isolated node(s):** `env`, `Remove common LaTeX markup from a string.`, `Split BibTeX author field on ' and ' into a list.`, `Return 'Best Paper' if note contains that phrase, else empty string.`, `Yugesh Bhattarai     ->     yugesh-bhattarai` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Per4ML Laboratory — research group at Texas State University` connect `Branding & Team Visuals` to `Project Documentation & Metadata`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Dr. Tanzima Z. Islam — PI, Associate Professor` connect `Project Documentation & Metadata` to `Branding & Team Visuals`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Per4ML Laboratory — research group at Texas State University` (e.g. with `Papers Icon (papersico2)` and `Courses Icon (courses2)`) actually correct?**
  _`Per4ML Laboratory — research group at Texas State University` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Per4ML Logo PNG - Green stylized text logo reading 'PER4ML' with circuit board graphic, primary visual identity of the Per4ML research lab` (e.g. with `Per4ML Logo SVG - Scalable vector version of the Per4ML lab logo, AI-generated content signed by Canva, 1920x768px, created with Inkscape` and `Per4ML Logo PNG duplicate (images/per4ml.png) - Green Per4ML logo with circuit board graphic, duplicate in images directory`) actually correct?**
  _`Per4ML Logo PNG - Green stylized text logo reading 'PER4ML' with circuit board graphic, primary visual identity of the Per4ML research lab` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `env`, `Remove common LaTeX markup from a string.`, `Split BibTeX author field on ' and ' into a list.` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Core & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Project Documentation & Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._