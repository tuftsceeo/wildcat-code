export const ColorSensorButtons = ({ color, children, className, onClick }) => {
    return (
      <button
        className={className}
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          border: 'none',
          width: '70px',
          height: '70px',
          cursor: 'pointer'
        }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };
  
  
  
  