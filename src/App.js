import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CommunityTimeline from './Timeline';
import CommunityDetail from './CommunityDetail';
import VenueTypeComparison from './EventType'; 
import CommunityEvolution from './CommunityEvolution';

const App = () => {
  return (
    <Router>
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<CommunityTimeline />} />
          <Route path="/community/:communityId" element={<CommunityDetail />} />
          <Route path="/event-type" element={<VenueTypeComparison />} />
          <Route path="/community-evolution" element={<CommunityEvolution />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;