import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Create from './Requisitions/Create';
import History from './Requisitions/History';

const Requisitions = () => {
    return (
        <Routes>
            <Route path="/create" element={<Create />} />
            <Route path="/history" element={<History />} />
        </Routes>
    );
};

export default Requisitions;