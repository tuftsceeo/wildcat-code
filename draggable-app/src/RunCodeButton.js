import React from 'react';
import Button from 'react-bootstrap/Button'
import './RunCodeButton.css'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function RunCodeButton() {
const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <Button className='play-button' onClick={handleClick}>
        <div className='word-icon'>
        Play
        <PlayArrowIcon color='white' sx={{height: '50px',
        width: '50px',}}/>
        </div>
    </Button>
  );
}

  export default RunCodeButton;