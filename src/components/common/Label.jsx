import React from 'react';

const Label = React.forwardRef(({ className, children, htmlFor, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-stone-800/90 ${className || ''}`}
    {...props}
  >
    {children}
  </label>
));
Label.displayName = "Label";

export default Label ;
// For consistency with other common components, you might prefer a default export:
// export default Label; 
// If so, adjust the import in EditProfileModal.jsx accordingly.
