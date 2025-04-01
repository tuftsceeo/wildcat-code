/**
 * Instruction templating system for mission tasks.
 * Handles replacing device port placeholders with actual port letters.
 */

import { getDeviceByName } from './DeviceTypes';
import motorIdentityManager from './MotorIdentity';

/**
 * Process an instruction template, replacing placeholders with device ports
 * @param {string} instruction - The instruction template
 * @param {Object} devices - Map of device types to port arrays
 * @returns {string} Processed instruction
 */
export function processInstructionTemplate(instruction, devices) {
  if (!instruction) return '';
  
  return instruction.replace(/{(\w+)}/g, (match, placeholder) => {
    // Match patterns like {leftMotorPort}, {rightMotorPort}, etc.
    const motorPortMatch = placeholder.match(/^(\w+)MotorPort$/);
    if (motorPortMatch) {
      const identity = motorPortMatch[1]; // e.g., "left"
      
      // Get port for this specific motor identity
      const port = motorIdentityManager.getPort(identity);
      if (port) {
        return port; // Return just the port letter (e.g., "A")
      }
    }
    
    // Match patterns like {leftMotor}, {rightMotor}, etc.
    const motorNameMatch = placeholder.match(/^(\w+)Motor$/);
    if (motorNameMatch) {
      const identity = motorNameMatch[1]; // e.g., "left"
      
      // Get port for this identity
      const port = motorIdentityManager.getPort(identity);
      if (port) {
        return `Motor ${port}`; // Return "Motor A" instead of "left motor"
      }
    }
    
    // Standard device type placeholder (e.g., motorPort)
    if (placeholder.endsWith('Port')) {
      const deviceName = placeholder.replace('Port', '');
      if (devices[deviceName] && devices[deviceName].length > 0) {
        return devices[deviceName].join(', ');
      }
    }
    
    return match; // Keep original if no replacement found
  });
}

/**
 * Process all instructions in a task array
 * @param {Array} tasks - Array of task objects
 * @param {Object} devices - Map of device types to port arrays
 */
export function processInstructions(tasks, devices) {
  if (!tasks || !Array.isArray(tasks)) return;
  
  tasks.forEach(task => {
    if (task.instruction) {
      task.processedInstruction = processInstructionTemplate(task.instruction, devices);
    }
  });
}

/**
 * Get a human-readable list of devices and their ports
 * @param {Object} devices - Map of device types to port arrays
 * @returns {string} Formatted device list
 */
export function formatDeviceList(devices) {
  if (!devices || Object.keys(devices).length === 0) {
    return 'No devices detected';
  }

  return Object.entries(devices)
    .map(([deviceType, ports]) => {
      const device = getDeviceByName(deviceType);
      if (!device) return null;
      
      return `${device.description} on port${ports.length > 1 ? 's' : ''} ${ports.join(', ')}`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Validate that all required device placeholders are present in the instruction
 * @param {string} instruction - The instruction template
 * @param {Array} requiredDevices - Array of required device names
 * @returns {boolean} Whether all required devices are referenced
 */
export function validateInstructionPlaceholders(instruction, requiredDevices) {
  if (!instruction || !requiredDevices) return true;
  
  const placeholders = instruction.match(/{(\w+)}/g) || [];
  const devicePlaceholders = placeholders
    .map(p => p.slice(1, -1))
    .filter(p => p.endsWith('Port'))
    .map(p => p.replace('Port', ''));
    
  return requiredDevices.every(device => 
    devicePlaceholders.includes(device.toLowerCase())
  );
}

/**
 * Get a list of device types referenced in an instruction
 * @param {string} instruction - The instruction template
 * @returns {Array} Array of device names referenced
 */
export function getReferencedDevices(instruction) {
  if (!instruction) return [];
  
  const placeholders = instruction.match(/{(\w+)}/g) || [];
  return placeholders
    .map(p => p.slice(1, -1))
    .filter(p => p.endsWith('Port'))
    .map(p => p.replace('Port', ''));
} 