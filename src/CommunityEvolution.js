import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import Papa from 'papaparse';

const CommunityEvolution = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [viewType, setViewType] = useState('events');
  const [displayMode, setDisplayMode] = useState('absolute'); // 'absolute' or 'percentage'
  const [temporalData, setTemporalData] = useState({});
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('all_communities_temporal.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const processedData = {};
            const allCommunitiesData = {};
            
            // Group data by community
            results.data.forEach(row => {
              if (!row.community_id && !row.year) return;
              
              if (!processedData[row.community_id]) {
                processedData[row.community_id] = [];
              }
              
              // Extract venue types and calculate totals
              const venueData = {};
              let yearTotal = 0;
              Object.keys(row).forEach(key => {
                if (key.startsWith('events_')) {
                  const venueType = key.replace('events_', '');
                  venueData[venueType] = row[key];
                  yearTotal += row[key];
                  
                  if (!allCommunitiesData[row.year]) {
                    allCommunitiesData[row.year] = { year: row.year, events: 0 };
                    Object.keys(venueDescriptions).forEach(type => {
                      allCommunitiesData[row.year][type] = 0;
                    });
                  }
                  allCommunitiesData[row.year][venueType] = (allCommunitiesData[row.year][venueType] || 0) + row[key];
                  allCommunitiesData[row.year].events = (allCommunitiesData[row.year].events || 0) + row[key];
                }
              });
              
              // Add both absolute numbers and percentages
              processedData[row.community_id].push({
                year: row.year,
                events: row.total_events,
                ...venueData,
                ...Object.keys(venueData).reduce((acc, venue) => {
                  acc[`${venue}_pct`] = (venueData[venue] / yearTotal) * 100;
                  return acc;
                }, {})
              });
            });
            
            // Process percentages for all communities data
            const allCommunitiesArray = Object.values(allCommunitiesData)
              .map(yearData => {
                const yearTotal = yearData.events;
                return {
                  ...yearData,
                  ...Object.keys(venueDescriptions).reduce((acc, venue) => {
                    acc[`${venue}_pct`] = (yearData[venue] / yearTotal) * 100;
                    return acc;
                  }, {})
                };
              })
              .sort((a, b) => a.year - b.year);
            
            processedData['all'] = allCommunitiesArray;
            
            setTemporalData(processedData);
            const communities = ['all', ...Object.keys(processedData).filter(key => key !== 'all').sort((a, b) => Number(a) - Number(b))];
            setAvailableCommunities(communities);
            setSelectedCommunity('all');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const venueDescriptions = {
    'CC-ART': 'Art Centers',
    'CC-ALT': 'Alternative Cultural Spaces',
    'TL-MUS': 'Museums',
    'TL-EDU': 'Educational Institutions',
    'CC-PER': 'Performance Venues',
    'CM-FNB': 'Cafes & Bars',
    'CS-ALL': 'Cultural Societies',
    'TL-LIB-LOC': 'Local Libraries',
    'TL-LIB-MAJ': 'Major Libraries',
    'CM-BOK-CHN': 'Chain Bookstores',
    'CM-BOK-IND': 'Independent Bookstores',
    'IC-CEN': 'International Centers'
  };

  const colors = {
    'CC-ART': '#ff7f0e',
    'CC-ALT': '#2ca02c',
    'TL-MUS': '#d62728',
    'TL-EDU': '#9467bd',
    'CC-PER': '#8c564b',
    'CM-FNB': '#e377c2',
    'CS-ALL': '#7f7f7f',
    'TL-LIB-LOC': '#bcbd22',
    'TL-LIB-MAJ': '#17becf',
    'CM-BOK-CHN': '#aec7e8',
    'CM-BOK-IND': '#1f77b4',
    'IC-CEN': '#ffbb78'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-bold">
            {selectedCommunity === 'all' ? 'All Communities' : `Community ${selectedCommunity}`} - {label}
          </p>
          {payload.map((entry, index) => {
            const value = displayMode === 'percentage' ? 
              `${entry.value.toFixed(1)}%` : 
              entry.value.toFixed(0);
            return (
              <p key={index} style={{ color: entry.color }}>
                {venueDescriptions[entry.dataKey.replace('_pct', '')] || entry.dataKey}: {value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="w-full p-6">Loading data...</div>;
  }

  if (!selectedCommunity || !temporalData[selectedCommunity]) {
    return <div className="w-full p-6">No data available</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Venue Distribution Over Time</h2>
        <div className="flex gap-4 mb-4">
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            {availableCommunities.map(comm => (
              <option key={comm} value={comm}>
                {comm === 'all' ? 'All Communities' : `Community ${comm}`}
              </option>
            ))}
          </select>
          <button
            className={`px-4 py-2 rounded ${viewType === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewType('events')}
          >
            Event Timeline
          </button>
          <button
            className={`px-4 py-2 rounded ${viewType === 'venues' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewType('venues')}
          >
            Venue Distribution
          </button>
          {viewType === 'venues' && (
            <button
              className={`px-4 py-2 rounded ${displayMode === 'percentage' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setDisplayMode(displayMode === 'absolute' ? 'percentage' : 'absolute')}
            >
              {displayMode === 'absolute' ? 'Show Percentages' : 'Show Numbers'}
            </button>
          )}
        </div>
      </div>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'events' ? (
            <LineChart
              data={temporalData[selectedCommunity]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="events" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Total Events" 
              />
            </LineChart>
          ) : (
            <ComposedChart
              data={temporalData[selectedCommunity]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis 
                label={{ 
                  value: displayMode === 'percentage' ? 'Percentage' : 'Number of Events',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.keys(venueDescriptions).map(venueType => (
                <Area
                  key={venueType}
                  type="monotone"
                  dataKey={displayMode === 'percentage' ? `${venueType}_pct` : venueType}
                  fill={colors[venueType]}
                  stroke={colors[venueType]}
                  stackId="1"
                  name={venueDescriptions[venueType]}
                />
              ))}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CommunityEvolution;