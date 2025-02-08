import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        {children}
    </div>
);

const CommunityInfo = ({ communities, selectedCommunity }) => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Community Information:</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(communities).map(([id, info]) => (
                <div
                    key={id}
                    className={`flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm transition-all
              ${selectedCommunity === info.name ? 'ring-2 ring-offset-2' : ''}
              ${!selectedCommunity || selectedCommunity === info.name ? 'opacity-100' : 'opacity-40'}
            `}
                >
                    <div
                        className="w-4 h-4 mt-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                    />
                    <div className="flex-grow">
                        <p className="font-medium text-lg">{info.name}</p>
                        <p className="text-sm text-gray-600 mb-2">Main venue: {info.mainVenue}</p>
                        {info.keyMembers && (
                            <div className="mt-1">
                                <p className="text-sm font-medium text-gray-700">Key members:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                                    {info.keyMembers.map((member, idx) => (
                                        <li key={idx} className="text-sm">
                                            {member.name}
                                            <span className="text-gray-500 text-xs">
                                                {" "}(centrality: {member.centrality})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const FloatingCommunityInfo = ({ community, onClose }) => {
    if (!community) return null;

    // Extract community ID from the name or pass it directly as a prop
    const communityId = community.name.match(/Community (\d+)/)?.[1];

    return (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: community.color }}
                    />
                    <h3 className="font-semibold text-lg">{community.name}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-sm text-gray-700">Main Venue</h4>
                    <p className="text-sm text-gray-600">{community.mainVenue}</p>
                </div>

                {community.topVenues && (
                    <div>
                        <h4 className="font-medium text-sm text-gray-700">Top Venues</h4>
                        <ul className="text-sm text-gray-600 mt-1">
                            {Object.entries(community.topVenues).map(([venue, count]) => (
                                <li key={venue} className="flex justify-between">
                                    <span>{venue}</span>
                                    <span className="text-gray-500">{count} events</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {community.keyMembers && (
                    <div>
                        <h4 className="font-medium text-sm text-gray-700">Key Members</h4>
                        <ul className="text-sm text-gray-600 mt-1">
                            {community.keyMembers.map((member, idx) => (
                                <li key={idx} className="flex justify-between">
                                    <span>{member.name}</span>
                                    <span className="text-gray-500">{member.centrality}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {communityId && (
                    <Link 
                        to={`/community/${communityId}`}
                        className="block mt-4 text-center py-2 px-4 bg-blue-50 hover:bg-blue-100 
                                 text-blue-600 rounded-md transition-colors duration-200"
                    >
                        View Detailed Network →
                    </Link>
                )}
            </div>
        </div>
    );
};



const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border rounded shadow-lg">
                <p className="text-sm font-bold mb-2">{`Year: ${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {`${entry.name}: ${entry.value.toFixed(1)}%`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const CommunityTimeline = () => {
    const [data, setData] = useState([]);
  const [communities, setCommunities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const selectedCommunityData = selectedCommunity ? 
        Object.values(communities).find(c => c.name === selectedCommunity) : 
        null;

    const handleLegendClick = (entry) => {
        if (selectedCommunity === entry.value) {
            setSelectedCommunity(null); // deselect if clicking the same community
        } else {
            setSelectedCommunity(entry.value);
        }
    };

    const CustomizedLegend = ({ payload }) => (
        <div className="flex flex-wrap gap-2 justify-center mt-2">
            {payload.map((entry) => (
                <div
                    key={entry.value}
                    className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-all
            ${selectedCommunity === entry.value ? 'ring-2 ring-offset-2' : 'hover:bg-gray-100'}
          `}
                    onClick={() => handleLegendClick(entry)}
                    style={{
                        borderColor: entry.color,
                        backgroundColor: selectedCommunity === entry.value ? `${entry.color}22` : 'transparent'
                    }}
                >
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm">{entry.value}</span>
                </div>
            ))}
        </div>
    );


    useEffect(() => {
        const processData = async () => {
          try {
            const [eventsResponse, communityDataResponse] = await Promise.all([
              fetch('/literary_events.csv'),
              fetch('/community_data.json')
            ]);
    
            if (!eventsResponse.ok || !communityDataResponse.ok) {
              throw new Error('Failed to fetch data files');
            }
    
            const [eventsText, communityDataJson] = await Promise.all([
              eventsResponse.text(),
              communityDataResponse.json()
            ]);
            
            // Set community metadata
            setCommunities(communityDataJson.community_metadata);
            
            // Process events data
            const events = Papa.parse(eventsText, {
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true
            }).data;
    
            // Process events by year and community
            const eventsByYear = events.reduce((acc, event) => {
              const year = new Date(event.date).getFullYear();
              const community = communityDataJson.event_communities[event.id];
              
              if (!acc[year]) {
                acc[year] = {
                  total: 0,
                  communities: Object.keys(communityDataJson.community_metadata).reduce((obj, comm) => ({
                    ...obj,
                    [communityDataJson.community_metadata[comm].name]: 0
                  }), {})
                };
              }
              
              acc[year].total++;
              const communityName = community in communityDataJson.community_metadata ? 
                communityDataJson.community_metadata[community].name : 
                "Other";
              acc[year].communities[communityName]++;
              
              return acc;
            }, {});
    
            // Convert to percentages for chart
            const chartData = Object.entries(eventsByYear)
              .map(([year, data]) => ({
                year: parseInt(year),
                ...Object.entries(data.communities).reduce((obj, [community, count]) => ({
                  ...obj,
                  [community]: (count / data.total) * 100
                }), {})
              }))
              .sort((a, b) => a.year - b.year);
    
            setData(chartData);
            setLoading(false);
          } catch (error) {
            console.error('Error processing data:', error);
            setError(error.message);
            setLoading(false);
          }
        };
    
        processData();
      }, []);

    if (loading) return (
        <Card>
            <div className="flex items-center justify-center h-96">
                <p className="text-lg text-gray-600">Loading data...</p>
            </div>
        </Card>
    );

    if (error) return (
        <Card>
            <div className="flex items-center justify-center h-96">
                <p className="text-lg text-red-600">Error: {error}</p>
            </div>
        </Card>
    );

    return (
        <Card className="w-full max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Literary Community Activity Distribution in Saint Petersburg (1999-2019)
            </h2>



            <div className="h-[600px] w-full">
                <ResponsiveContainer>
                <AreaChart
                        data={data}
                        margin={{ top: 10, right: selectedCommunity ? 96 : 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomizedLegend />} />
                        {Object.entries(communities).map(([id, info]) => (
                            <Area
                                key={id}
                                type="monotone"
                                dataKey={info.name}
                                stackId="1"
                                stroke={info.color}
                                fill={info.color}
                                name={info.name}
                                style={{
                                    opacity: selectedCommunity ?
                                        (selectedCommunity === info.name ? 1 : 0.2) : 1
                                }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
                {selectedCommunityData && (
                    <FloatingCommunityInfo
                        community={selectedCommunityData}
                        onClose={() => setSelectedCommunity(null)}
                    />
                )}
            </div>
            <div className="mt-6 mb-8 flex gap-4 justify-center">
                <Link 
                    to="/community-evolution"
                    className="flex-1 max-w-xs text-center py-3 px-4 bg-green-50 hover:bg-green-100 
                             text-green-600 rounded-md transition-colors duration-200 border border-green-200"
                >
                    <span className="block font-medium">Community Evolution</span>
                    <span className="text-sm text-green-500">Explore how communities change over time</span>
                </Link>
                
                <Link 
                    to="/event-type"
                    className="flex-1 max-w-xs text-center py-3 px-4 bg-purple-50 hover:bg-purple-100 
                             text-purple-600 rounded-md transition-colors duration-200 border border-purple-200"
                >
                    <span className="block font-medium">Event Types</span>
                    <span className="text-sm text-purple-500">Analyze different types of events</span>
                </Link>
            </div>

            <div className="mt-4 space-y-2">
                <CommunityInfo
                    communities={communities}
                    selectedCommunity={selectedCommunity}
                />
                <p className="text-sm text-gray-600">* Activity shown as percentage of total events per year for each community</p>
                <p className="text-sm text-gray-600">* Click on community labels to see detailed information</p>
                <p className="text-sm text-gray-600">* Based on detected communities from network analysis</p>
            </div>
        </Card>
    );
};

export default CommunityTimeline;