import React, { useState, useEffect } from 'react';

const FlashMessage = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{ display: isVisible ? 'block' : 'none', 
                  borderRadius: '5px',position: 'fixed',
                  top: '10%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '20px',
                  zIndex: 1000, 
                  width:"110px",
                  backgroundColor: type === 'error' ? '#F84F31' : '#23C552', 
                  color: 'white', textAlign: 'center' }}>
      {message}
    </div>
  );
};

export default FlashMessage;
