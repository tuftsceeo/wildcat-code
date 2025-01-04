const DEFAULT_MOTOR_SPEED = 1000;  // Default speed in degrees/sec

const generatePythonCode = (slots) => {
    // Generate imports
    let code = [
        'import runloop',
        'import time',
        'from hub import port',
        'import motor',
        '',
        'async def main():',
    ];

    // Generate code for each slot
    slots.forEach((slot, index) => {
        if (!slot || !slot.type) return;  // Skip empty slots

        // Add indentation for the main function
        const indent = '    ';
        let slotCode = [];

        if (slot.type === 'action' && slot.subtype === 'motor') {
            const config = slot.configuration || {};
            const buttonType = config.buttonType;
            const portLetter = config.port || 'C';  // Default to port C if not specified

            if (buttonType === 'GO') {
                // For now, use default speed. Later will be configurable
                slotCode.push(`${indent}motor.run(port.${portLetter}, ${DEFAULT_MOTOR_SPEED})`);
            } else if (buttonType === 'STOP') {
                slotCode.push(`${indent}motor.stop(port.${portLetter})`);
            }
        } else if (slot.type === 'input' && slot.subtype === 'time') {
            const config = slot.configuration || {};
            const milliseconds = (config.seconds || 1) * 1000;  // Convert seconds to milliseconds
            slotCode.push(`${indent}await runloop.sleep_ms(${milliseconds})`);
        }

        // Add comment to indicate which slot this code belongs to
        if (slotCode.length > 0) {
            code.push(`${indent}# Slot ${index}`);
            code = code.concat(slotCode);
        }
    });

    // Add the runloop execution
    code.push('');
    code.push('runloop.run(main())');

    return code.join('\n');
};

export { generatePythonCode };