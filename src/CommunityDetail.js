// CommunityDetail.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';

const CommunityDetail = () => {
    const { communityId } = useParams();
    const containerRef = useRef();
    const svgRef = useRef();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [communityData, setCommunityData] = useState(null);
    const [networkData, setNetworkData] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 }); // Default dimensions

    // Track container size with ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            const container = containerRef.current;
            if (container) {
                const rect = container.getBoundingClientRect();
                setDimensions({
                    width: Math.max(rect.width, 800),  // Minimum width
                    height: Math.max(rect.height, 600)  // Minimum height
                });
            }
        };

        // Initial update
        updateDimensions();

        // Create ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            updateDimensions();
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [metadataResponse, networkResponse] = await Promise.all([
                    fetch('/community_data.json'),
                    fetch(`/community_networks/community_${communityId}_network.json`)
                ]);

                if (!metadataResponse.ok || !networkResponse.ok) {
                    throw new Error('Failed to fetch community data');
                }

                const [metadataJson, networkJson] = await Promise.all([
                    metadataResponse.json(),
                    networkResponse.json()
                ]);

                console.log('Network data structure:', networkJson); // Debug log

                const metadata = metadataJson.community_metadata[communityId];

                setCommunityData(metadata);
                setNetworkData(networkJson);
                setLoading(false);
            } catch (error) {
                console.error('Fetch error:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [communityId]);

    // Initialize or update visualization
    useEffect(() => {
        if (!networkData?.network?.nodes || !svgRef.current) return;

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
            .attr("width", "100%")
            .attr("height", "100%");

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "10px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
            .style("z-index", "1000")
            .style("max-width", "200px");

        // Clear previous content
        svg.selectAll("*").remove();

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Create main group for zoom/pan
        const g = svg.append("g");

        // Create force simulation
        const simulation = d3.forceSimulation(networkData.network.nodes)
            .force("link", d3.forceLink(networkData.network.edges)
                .id(d => d.id)
                .distance(d => 80 / (d.weight || 1)))  // Decreased from 150 to 80
            .force("charge", d3.forceManyBody().strength(-400))  // Decreased from -500 to -400
            .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
            .force("collision", d3.forceCollide().radius(30));

        // Draw links
        const link = g.append("g")
            .selectAll("line")
            .data(networkData.network.edges)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.weight));

        // Create node groups
        const node = g.append("g")
            .selectAll("g")
            .data(networkData.network.nodes)
            .join("g")
            .call(drag(simulation));

        const gradientDefs = svg.append("defs");
        const centralityValues = networkData.network.nodes.map(d => parseFloat(d.centrality));
        const minCentrality = Math.min(...centralityValues);
        const maxCentrality = Math.max(...centralityValues);
        // Create a scale function that maps centrality to radius
        const radiusScale = d3.scalePow()  // Using power scale for better differentiation
            .exponent(0.5)  // Square root scaling for more gradual size changes
            .domain([minCentrality, maxCentrality])
            .range([5, 40]);  // min radius 5px, max radius 40px


        node.each(function (d, i) {
            const gradientId = `gradient-${i}`;
            const gradient = gradientDefs.append("radialGradient")
                .attr("id", gradientId)
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", networkData.color)
                .attr("stop-opacity", 1);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", networkData.color)
                .attr("stop-opacity", 0.6);

            // Use the scale function for radius
            const radius = radiusScale(parseFloat(d.centrality));

            const nodeElement = d3.select(this);

            nodeElement.append("circle")
                .attr("r", radius)
                .attr("fill", `url(#${gradientId})`)
                .attr("stroke", networkData.color)
                .attr("stroke-width", 1.5)
                .on("mouseover", (event) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`
            <div style="border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 4px; font-weight: bold;">${d.name}</div>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px;">
                <div style="color: #666;">Centrality:</div>
                <div>${parseFloat(d.centrality).toFixed(3)}</div>
                <div style="color: #666;">Events:</div>
                <div>${d.events}</div>
                <div style="color: #666;">Weight:</div>
                <div>${d.weighted_participation || "N/A"}</div>
            </div>
        `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mousemove", (event) => {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });
        simulation
            .force("collision", d3.forceCollide().radius(d => radiusScale(parseFloat(d.centrality)) + 2))
            .force("link", d3.forceLink(networkData.network.edges)
                .id(d => d.id)
                .distance(d => 60 + radiusScale(parseFloat(d.source.centrality)) + radiusScale(parseFloat(d.target.centrality))));

        // Add labels with background
        const labels = node.append("g")
            .attr("class", "label");

        labels.append("text")
            .attr("x", d => Math.max(6, parseFloat(d.centrality) * 50 + 2))
            .attr("y", ".31em")
            .text(d => d.name)
            .attr("fill", "black")
            .style("font-size", "12px");

        // // Add title for hover effect
        // node.append("title")
        //     .text(d => `${d.name}\nCentrality: ${d.centrality}\nEvents: ${d.events}`);

        // Update positions on tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
            d3.select("body").selectAll(".tooltip").remove();
        };
    }, [networkData, dimensions]);

    // Drag behavior
    const drag = (simulation) => {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="h-screen flex items-center justify-center text-red-600">Error: {error}</div>;

    return (
        <div className="h-screen p-4">
            <div className="flex h-full gap-4">
                <div className="flex-1 border rounded-lg bg-white" style={{ minHeight: '600px' }} ref={containerRef}>
                    <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
                </div>
                <div className="w-80 bg-white rounded-lg shadow p-4 overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">{communityData?.name}</h2>
                    <div className="space-y-4">
                        {networkData?.network?.filter_stats && (
                            <div>
                                <h3 className="font-medium">Filter Statistics</h3>
                                <ul className="text-sm text-gray-600">
                                    <li>Total members: {networkData.network.filter_stats.total_nodes}</li>
                                    <li>Active members: {networkData.network.filter_stats.active_nodes}</li>
                                    <li>Min events threshold: {networkData.network.filter_stats.min_events}</li>
                                </ul>
                            </div>
                        )}
                        {networkData?.statistics && (
                            <div>
                                <h3 className="font-medium">Network Statistics</h3>
                                <ul className="text-sm text-gray-600">
                                    <li>Density: {networkData.statistics.density.toFixed(3)}</li>
                                    <li>Average Degree: {networkData.statistics.avg_degree.toFixed(1)}</li>
                                    <li>Clustering: {networkData.statistics.clustering_coefficient.toFixed(3)}</li>
                                    <li>Total Edges: {networkData.statistics.number_of_edges}</li>
                                </ul>
                            </div>
                        )}
                        {communityData?.keyMembers && (
                            <div>
                                <h3 className="font-medium">Key Members</h3>
                                <ul className="text-sm text-gray-600">
                                    {communityData.keyMembers.map((member, idx) => (
                                        <li key={idx} className="flex justify-between py-1">
                                            <span>{member.name}</span>
                                            <span>({member.centrality})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mt-8 flex justify-center">
        <Link
          to="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md 
                   transition-colors duration-200 flex items-center gap-2"
        >
          ← Return to Main Page
        </Link>
      </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default CommunityDetail;