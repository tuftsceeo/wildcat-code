/**
 * Device type definitions and utilities for the mission system.
 * Maps human-readable device names to device type codes and provides helper functions.
 */

/**
 * Mapping of device types to their properties
 * @type {Object}
 */
export const DEVICE_TYPES = {
  MOTOR: {
    name: "motor",
    codes: [0x0A, 0x30], // Both codes used for motors
    portLabel: "motorPort",
    description: "A motor that can spin in either direction"
  },
  FORCE_SENSOR: {
    name: "button",
    codes: [0x0B, 0x3c],
    portLabel: "buttonPort",
    description: "A button or force sensor that can detect presses"
  },
  DISTANCE_SENSOR: {
    name: "distance",
    codes: [0x0C, 0x3d],
    portLabel: "distancePort",
    description: "A sensor that measures distance"
  },
  LIGHT_SENSOR: {
    name: "light",
    codes: [0x0D, 0x3e],
    portLabel: "lightPort",
    description: "A sensor that measures light levels"
  },
  SOUND_SENSOR: {
    name: "sound",
    codes: [0x0E, 0x3f],
    portLabel: "soundPort",
    description: "A sensor that measures sound levels"
  }
};

/**
 * Get a device type object by its human-readable name
 * @param {string} name - The human-readable name of the device
 * @returns {Object|null} The device type object or null if not found
 */
export function getDeviceByName(name) {
  return Object.values(DEVICE_TYPES).find(device => 
    device.name === name.toLowerCase()) || null;
}

/**
 * Get a device type object by its device code
 * @param {number} code - The device type code
 * @returns {Object|null} The device type object or null if not found
 */
export function getDeviceByCode(code) {
  return Object.values(DEVICE_TYPES).find(device => 
    device.codes.includes(code)) || null;
}

/**
 * Check if a device code matches a required device name
 * @param {number} deviceCode - The device type code to check
 * @param {string} requiredDeviceName - The required device name
 * @returns {boolean} Whether the device matches the requirement
 */
export function deviceMatchesRequirement(deviceCode, requiredDeviceName) {
  const device = getDeviceByName(requiredDeviceName);
  return device ? device.codes.includes(deviceCode) : false;
}

/**
 * Get all available device types
 * @returns {Array} Array of device type objects
 */
export function getAllDeviceTypes() {
  return Object.values(DEVICE_TYPES);
}

/**
 * Get the port label for a device type
 * @param {string} deviceName - The device name
 * @returns {string|null} The port label or null if not found
 */
export function getPortLabel(deviceName) {
  const device = getDeviceByName(deviceName);
  return device ? device.portLabel : null;
}

/**
 * Debug utility to identify unknown device types
 * @param {number} code - The unknown device code
 * @returns {string} A debug message
 */
export function debugUnknownDevice(code) {
  return `Unknown device type code: 0x${code.toString(16)}`;
} 