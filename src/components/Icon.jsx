import React, { useState, useEffect } from "react";

const Icon = ({ src, width = 24, height = 24, ...props }) => {
  const [iconContent, setIconContent] = useState("");

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const response = await fetch(src);
        const svgContent = await response.text();
        setIconContent(svgContent);
      } catch (error) {
        console.error("Error loading SVG:", error);
      }
    };

    loadIcon();
  }, [src]);

  return (
    <span
      dangerouslySetInnerHTML={{ __html: iconContent }}
      style={{ display: "inline-block", width, height }}
      {...props}
    />
  );
};

export default Icon;
