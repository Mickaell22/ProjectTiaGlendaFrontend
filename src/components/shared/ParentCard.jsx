// src/components/shared/ParentCard.jsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ParentCard = ({ title, children }) => {
  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 2 }}>
        {title && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default ParentCard;
