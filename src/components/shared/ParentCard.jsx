// src/components/shared/ParentCard.jsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ParentCard = ({ title, children }) => {
  return (
    <Card elevation={3} sx={{ padding: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default ParentCard;
