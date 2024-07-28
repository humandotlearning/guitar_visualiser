import React, { useState } from 'react';

const Collapsible = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(props.defaultOpen || false);

  return (
    <div {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

const CollapsibleTrigger = ({ children, isOpen, setIsOpen }) => {
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {children}
    </button>
  );
};

const CollapsibleContent = ({ children, isOpen }) => {
  if (!isOpen) return null;
  return <div>{children}</div>;
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };