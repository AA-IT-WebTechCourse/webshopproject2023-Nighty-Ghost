import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

const FlashMessage = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const closeFlashmessage = () => {
    setIsVisible(false);
    onClose();
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
       //console.log("SETVISIBLE NONE")
      onClose();
    }, 5000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{ display: isVisible ? 'block' : 'none', 
                  borderRadius: '5px',position: 'fixed',
                  top: '5%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '20px',
                  zIndex: 1000, 
                  width:"800px",
                  backgroundColor: type === 'error' ? '#F84F31' : '#23C552', 
                  color: 'white', textAlign: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

  <div style={{ display: 'flex', flexDirection: 'column', width: '95%', alignItems: 'center', fontSize:'16px' }}>
    {message}
  </div>

  <div style={{ width: "5%", display: 'flex', flexDirection: 'column', marginLeft: '10px', cursor: 'pointer', color: 'white' }}>
    <AiOutlineClose size={15} onClick={closeFlashmessage}  />
  </div>
</div>
    </div>
  );
};

export default FlashMessage;
