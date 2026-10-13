import React, { useEffect } from 'react';

interface Props {
  schema: Record<string, any> | Record<string, any>[];
}

export const SeoJsonLd: React.FC<Props> = ({ schema }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};
