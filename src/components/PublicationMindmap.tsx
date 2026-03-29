import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';

interface MindmapNode {
  name: string;
  url?: string;
  children?: MindmapNode[];
}

const data: MindmapNode = {
  name: "Per4ML Lab",
  children: [
    {
      name: "High-Performance Computing",
      children: [
        {
          name: "SC'24",
          children: [
            { name: "Efficient I/O for Exascale Deep Learning", url: "#" },
            { name: "Parallel Algorithms for Scientific Apps", url: "#" }
          ]
        },
        {
          name: "IPDPS'23",
          children: [
            { name: "Communication-Efficient Protocols", url: "#" }
          ]
        }
      ]
    },
    {
      name: "AI/ML Optimization",
      children: [
        {
          name: "NeurIPS'25",
          children: [
            { name: "Scaling Laws for Distributed Training", url: "#" }
          ]
        },
        {
          name: "ICML'24",
          children: [
            { name: "Sparse Attention Mechanisms", url: "#" },
            { name: "Hardware-Aware Neural Architecture Search", url: "#" }
          ]
        }
      ]
    },
    {
      name: "Data-Driven Modeling",
      children: [
        {
          name: "KDD'24",
          children: [
            { name: "Physics-Informed Neural Networks", url: "#" },
            { name: "Robust Surrogate Models", url: "#" }
          ]
        }
      ]
    },
    {
      name: "Parallel I/O Systems",
      children: [
        {
          name: "FAST'25",
          children: [
            { name: "Next-Generation Storage Solutions", url: "#" }
          ]
        },
        {
          name: "HPDC'23",
          children: [
            { name: "Alleviating Data Bottlenecks", url: "#" }
          ]
        }
      ]
    }
  ]
};

export default function PublicationMindmap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;
    const nodeWidth = 220;
    const nodeHeight = 60;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-margin.left, -margin.top, width, height].join(" "))
      .style("font", "14px sans-serif")
      .style("user-select", "none");

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    
    // Initial transform to center the root slightly to the left
    svg.call(zoom.transform, d3.zoomIdentity.translate(margin.left, height / 2 - margin.top));

    const tree = d3.tree<MindmapNode>()
      .nodeSize([nodeHeight + 20, nodeWidth + 80]);

    // Define hierarchy
    const root = d3.hierarchy<MindmapNode>(data);
    
    // Collapse function
    root.descendants().forEach((d: any) => {
      d._children = d.children;
      // Collapse nodes deeper than level 1 initially
      if (d.depth > 1) {
        d.children = null;
      }
    });

    let i = 0;

    function update(source: any) {
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const transition = svg.transition()
        .duration(250)
        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

      // Update the nodes…
      const node = g.selectAll<SVGGElement, d3.HierarchyPointNode<MindmapNode>>("g.node")
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${source.y0 || source.y},${source.x0 || source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d: any) => {
          if (d.data.url) {
            window.open(d.data.url, "_blank");
            return;
          }
          d.children = d.children ? null : d._children;
          update(d);
        })
        .style("cursor", d => d.data.url || d._children ? "pointer" : "default");

      // Node background (equal width)
      nodeEnter.append("rect")
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("y", -nodeHeight / 2)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "white")
        .attr("stroke", d => d._children ? "#6366f1" : "#e4e4e7") // indigo-500 : zinc-200
        .attr("stroke-width", 2)
        .attr("class", "dark:fill-zinc-800 dark:stroke-zinc-700 shadow-sm transition-colors hover:stroke-indigo-500 dark:hover:stroke-indigo-400");

      // Node text
      nodeEnter.append("foreignObject")
        .attr("width", nodeWidth - 20)
        .attr("height", nodeHeight)
        .attr("x", 10)
        .attr("y", -nodeHeight / 2)
        .append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("text-align", "center")
        .style("font-size", "13px")
        .style("font-weight", "500")
        .style("color", "currentColor")
        .attr("class", "text-zinc-800 dark:text-zinc-200")
        .html(d => d.data.name);

      // Transition nodes to their new position.
      const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links…
      const link = g.selectAll<SVGPathElement, d3.HierarchyPointLink<MindmapNode>>("path.link")
        .data(links, (d: any) => d.target.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#d4d4d8") // zinc-300
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2)
        .attr("d", d => {
          const o = { x: source.x0 || source.x, y: source.y0 || source.y };
          return diagonal({ source: o, target: o });
        });

      // Transition links to their new position.
      link.merge(linkEnter).transition(transition)
        .attr("d", d => diagonal({
          source: { x: d.source.x, y: d.source.y + nodeWidth },
          target: d.target
        }));

      // Transition exiting nodes to the parent's new position.
      link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      // Stash the old positions for transition.
      root.eachBefore((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function diagonal(s: any) {
      return `M ${s.source.y} ${s.source.x}
              C ${(s.source.y + s.target.y) / 2} ${s.source.x},
                ${(s.source.y + s.target.y) / 2} ${s.target.x},
                ${s.target.y} ${s.target.x}`;
    }

    update(root);

  }, []);

  return (
    <div className="w-full bg-indigo-50/30 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-inner">
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <button className="px-4 py-2 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
          Show Collaboration Network
        </button>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
          Download BibTeX
        </button>
      </div>
      <div ref={containerRef} className="w-full h-[600px] cursor-grab active:cursor-grabbing">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full origin-center"
        >
          <svg ref={svgRef} className="w-full h-full"></svg>
        </motion.div>
      </div>
      <div className="absolute bottom-6 left-6 z-10 flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-indigo-500"></div>
          <span>Collapsible Category</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
          <span>Clickable Paper</span>
        </div>
      </div>
    </div>
  );
}
