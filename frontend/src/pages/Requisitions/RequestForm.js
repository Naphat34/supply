import React, { useState } from 'react';
import { Box } from '@mui/material';
import RequestHeader from './components/RequestHeader';
import RequestFormContent from './components/RequestFormContent';
import RequestItemsTable from './components/RequestItemsTable';
import RequestSummary from './components/RequestSummary';

const RequestForm = () => {
    const [requestData, setRequestData] = useState({
        items: [],
        totalQuantity: 0,
        // Add other necessary fields here
    });

    const handleAddItem = (item) => {
        setRequestData((prevData) => ({
            ...prevData,
            items: [...prevData.items, item],
            totalQuantity: prevData.totalQuantity + item.quantity,
        }));
    };

    const handleRemoveItem = (itemId) => {
        setRequestData((prevData) => {
            const updatedItems = prevData.items.filter(item => item.id !== itemId);
            const updatedTotalQuantity = updatedItems.reduce((total, item) => total + item.quantity, 0);
            return {
                ...prevData,
                items: updatedItems,
                totalQuantity: updatedTotalQuantity,
            };
        });
    };

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default' }}>
            <RequestHeader />
            <RequestFormContent onAddItem={handleAddItem} />
            <RequestItemsTable items={requestData.items} onRemoveItem={handleRemoveItem} />
            <RequestSummary totalQuantity={requestData.totalQuantity} />
        </Box>
    );
};

export default RequestForm;