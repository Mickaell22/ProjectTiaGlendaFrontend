// src/components/shared/ModernTabs.jsx
// Componente de pestañas modernas reutilizable

import React from 'react';
import { Paper, Tabs, Tab, Box } from '@mui/material';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ModernTabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  elevation = 2 
}) => {
  return (
    <>
      <Paper elevation={elevation} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => onTabChange(newValue)} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              icon={tab.icon} 
              disabled={tab.disabled}
            />
          ))}
        </Tabs>
      </Paper>

      {tabs.map((tab, index) => (
        <TabPanel key={index} value={activeTab} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </>
  );
};

export { TabPanel };
export default ModernTabs;