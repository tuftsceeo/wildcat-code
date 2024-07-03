import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import AirplayIcon from '@mui/icons-material/Airplay';
import AlbumIcon from '@mui/icons-material/Album';
import CheckIcon from '@mui/icons-material/Check';
// import './CheckButton.css'

const CheckButton = () => {
  const [clicked, setClicked] = useState(false);

  const handleButtonClick = () => {
    setClicked(!clicked);
  };

  return (
    <IconButton
      onClick={handleButtonClick}
      disableRipple={true}
      sx={{
        height: '170px',
        width: '170px',
        backgroundColor: 'success',
      boxShadow: clicked ? '0 0.5px 0.5px rgba(0, 0, 0, 0.01)' : 'none',
        transition: 'box-shadow 0.8s ease-in-out, background-color 0.8s ease-in-out',
        padding: '0px',
        '&:hover': {
          backgroundColor: 'success.light',
        },
        '&:active': {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.01)',
         backgroundColor: 'success.dark',
        },
      }}
    >
      <CheckCircleTwoToneIcon color='success' sx={{height: '200px',
        width: '200px',}}/>
    </IconButton>
  );
};

export default CheckButton;