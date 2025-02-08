import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const VenueTypeComparison = () => {
  const [viewMode, setViewMode] = useState('absolute');
  
  const venueDescriptions = {
    'CM-BOK-IND': 'Independent Bookstores',
    'CC-ART': 'Art Centers',
    'CC-ALT': 'Alternative Cultural Spaces',
    'TL-MUS': 'Museums',
    'TL-EDU': 'Educational Institutions',
    'CC-PER': 'Performance Venues',
    'CM-FNB': 'Food & Beverage Venues',
    'CS-ALL': 'Cultural Societies',
    'TL-LIB-LOC': 'Local Libraries',
    'TL-LIB-MAJ': 'Major Libraries',
    'CM-BOK-CHN': 'Chain Bookstores',
    'IC-CEN': 'International Centers'
  };

  const rawData = [
    {
      community: '0',
      'CM-BOK-IND': 308,
      'CC-ART': 213,
      'CC-ALT': 121,
      'TL-MUS': 112,
      'TL-EDU': 99,
      'CC-PER': 92,
      'CM-FNB': 84,
      'CS-ALL': 74,
      'TL-LIB-LOC': 32,
      'TL-LIB-MAJ': 27,
      'CM-BOK-CHN': 25,
      'IC-CEN': 13
    },
    {
      community: '5',
      'TL-MUS': 419,
      'CC-ART': 359,
      'CM-FNB': 302,
      'CS-ALL': 298,
      'CM-BOK-IND': 297,
      'CC-ALT': 236,
      'TL-LIB-MAJ': 178,
      'TL-EDU': 103,
      'CC-PER': 84,
      'TL-LIB-LOC': 59,
      'CM-BOK-CHN': 49,
      'IC-CEN': 22
    },
    {
      community: '1',
      'CC-ALT': 270,
      'CM-FNB': 251,
      'CC-ART': 194,
      'CC-PER': 164,
      'TL-LIB-LOC': 125,
      'CS-ALL': 117,
      'CM-BOK-CHN': 103,
      'CM-BOK-IND': 85,
      'TL-MUS': 64,
      'TL-LIB-MAJ': 53,
      'TL-EDU': 30,
      'IC-CEN': 0
    },
    {
      community: '17',
      'CM-BOK-CHN': 212,
      'CM-BOK-IND': 197,
      'CC-ALT': 173,
      'CC-ART': 167,
      'TL-MUS': 142,
      'CM-FNB': 138,
      'CS-ALL': 82,
      'CC-PER': 76,
      'TL-LIB-MAJ': 75,
      'TL-EDU': 71,
      'TL-LIB-LOC': 61,
      'IC-CEN': 6
    },
    {
      community: '7',
      'CS-ALL': 263,
      'CC-ALT': 191,
      'CM-FNB': 166,
      'TL-LIB-MAJ': 132,
      'CC-ART': 130,
      'CC-PER': 116,
      'TL-LIB-LOC': 103,
      'TL-MUS': 102,
      'CM-BOK-IND': 83,
      'TL-EDU': 53,
      'CM-BOK-CHN': 51,
      'IC-CEN': 2
    },
    {
      community: '3',
      'TL-MUS': 565,
      'CS-ALL': 221,
      'CM-BOK-IND': 162,
      'TL-LIB-MAJ': 133,
      'CM-BOK-CHN': 124,
      'TL-LIB-LOC': 118,
      'CC-ART': 86,
      'CC-ALT': 80,
      'TL-EDU': 80,
      'CM-FNB': 65,
      'CC-PER': 58,
      'IC-CEN': 5
    }
  ];

  const processData = (data) => {
    if (viewMode === 'absolute') {
      return data;
    } else {
      return data.map(community => {
        const total = Object.entries(community)
          .filter(([key]) => key !== 'community')
          .reduce((sum, [_, value]) => sum + value, 0);
        
        const processed = { community: community.community };
        Object.entries(community)
          .filter(([key]) => key !== 'community')
          .forEach(([key, value]) => {
            processed[key] = (value / total) * 100;
          });
        return processed;
      });
    }
  };

  const data = processData(rawData);
  
  const colors = {
    'CM-BOK-IND': '#1f77b4',
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
    'IC-CEN': '#ffbb78'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-bold">Community {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {venueDescriptions[entry.dataKey]}: {viewMode === 'absolute' 
                ? entry.value.toFixed(0) 
                : entry.value.toFixed(1) + '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Venue Type Distribution by Community</h2>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded ${viewMode === 'absolute' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('absolute')}
          >
            Absolute Numbers
          </button>
          <button
            className={`px-4 py-2 rounded ${viewMode === 'percentage' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('percentage')}
          >
            Percentages
          </button>
        </div>
      </div>
      <div className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            height={500}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="community" label={{ value: 'Community', position: 'bottom' }} />
            <YAxis label={{ 
              value: viewMode === 'absolute' ? 'Number of Events' : 'Percentage of Events', 
              angle: -90, 
              position: 'insideLeft'
            }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal"
              wrapperStyle={{
                paddingTop: 20,
                width: '100%'
              }}
              margin={{ top: 20 }}
              verticalAlign="bottom"
              align="center"
              iconSize={10}
              itemStyle={{ fontSize: 12, marginRight: 10 }}
              formatter={(value) => `${value}`}
            />
            {Object.keys(venueDescriptions).map((venueType) => (
              <Bar
                key={venueType}
                dataKey={venueType}
                name={venueDescriptions[venueType]}
                stackId="a"
                fill={colors[venueType]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
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
  );
};

export default VenueTypeComparison;