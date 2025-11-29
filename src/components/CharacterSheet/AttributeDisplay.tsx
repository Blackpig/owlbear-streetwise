import React from 'react';

interface AttributeDisplayProps {
  name: string;
  value: number;
  penalty: number;
}

export const AttributeDisplay: React.FC<AttributeDisplayProps> = ({
  name,
  value,
  penalty
}) => {
  const effectiveValue = Math.max(0, value - penalty);

  return (
    <div className="attribute-display">
      <div className="attribute-name">{name}</div>
      <div className="attribute-value">
        {value}
        {penalty > 0 && (
          <span className="attribute-penalty"> (-{penalty})</span>
        )}
      </div>
      {penalty > 0 && (
        <div className="attribute-effective">= {effectiveValue}</div>
      )}
    </div>
  );
};
