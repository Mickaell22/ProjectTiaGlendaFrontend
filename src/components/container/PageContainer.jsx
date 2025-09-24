// src/components/container/PageContainer.js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const PageContainer = ({ title, description, children }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return <div>{children}</div>;
};

PageContainer.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
};

export default PageContainer;