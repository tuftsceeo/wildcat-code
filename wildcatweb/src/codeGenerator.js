const generatePythonCode = (slots, portStates) => {
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
            // Handle both single motor config and multiple motor configs
            const configs = Array.isArray(slot.configuration) 
                ? slot.configuration 
                : [slot.configuration];

            // Process each motor configuration
            configs.forEach(config => {
                if (!config || !config.port || !config.command) return;

                const portLetter = config.port;
                const command = config.command;
                const speed = config.speed || 1000;

                // Check if motor is currently connected
                if (!portStates[portLetter]) {
                    slotCode.push(`${indent}# Motor ${portLetter} is disconnected`);
                    slotCode.push(`${indent}pass  # Skipping command for disconnected motor`);
                    return;
                }

                switch (command) {
                    case 'GO':
                        slotCode.push(`${indent}motor.run(port.${portLetter}, ${speed})`);
                        break;
                    case 'STOP':
                        slotCode.push(`${indent}motor.stop(port.${portLetter})`);
                        break;
                    case 'SET_SPEED':
                        slotCode.push(`${indent}motor.run(port.${portLetter}, ${speed})`);
                        break;
                }
            });
        } else if (slot.type === 'input' && slot.subtype === 'time') {
            const config = slot.configuration || {};
            const milliseconds = (config.seconds || 1) * 1000;  // Convert seconds to milliseconds
            slotCode.push(`${indent}await runloop.sleep_ms(${milliseconds})`);
        }

        // Add comment to indicate which slot this code belongs to
        if (slotCode.length > 0) {
            code.push(`${indent}# Slot ${index + 1}`);
            code = code.concat(slotCode);
        }
    });

    // Add the runloop execution
    code.push('');
    code.push('runloop.run(main())');

    return code.join('\n');
};

export { generatePythonCode };