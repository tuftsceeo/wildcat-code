/**
 * @file MotorIdentity.js
 * @description Manages semantic identities for motors with dynamic port assignment
 */

/**
 * Motor identity mapping structure
 * Maps semantic identities to physical ports and vice versa
 */
class MotorIdentityManager {
  constructor() {
    // Map of motor identities to port letters
    // e.g., { "left": "A", "right": "B" }
    this.identityToPortMap = {};
    
    // Reverse mapping for lookups
    // e.g., { "A": "left", "B": "right" }
    this.portToIdentityMap = {};
    
    // Store the motor identity definitions from missions
    // e.g., { "left": { role: "drive" }, "right": { role: "arm" } }
    this.identityDefinitions = {};
  }
  
  /**
   * Store motor identity definitions from a mission
   * Does not assign ports yet, just stores the definitions
   * 
   * @param {Object} definitions - Identity definitions from mission
   */
  setIdentityDefinitions(definitions) {
    this.identityDefinitions = { ...definitions };
    // Clear any existing mappings
    this.identityToPortMap = {};
    this.portToIdentityMap = {};
  }
  
  /**
   * Assign available ports to the defined motor identities
   * 
   * @param {Array<string>} availablePorts - Array of detected port letters
   * @returns {Object} The assigned mapping from identities to ports
   */
  assignPorts(availablePorts) {
    if (!this.identityDefinitions || Object.keys(this.identityDefinitions).length === 0) {
      return {};
    }
    
    const identities = Object.keys(this.identityDefinitions);
    
    // Clear any existing mappings
    this.identityToPortMap = {};
    this.portToIdentityMap = {};
    
    // Skip if we have more identities than ports
    if (identities.length > availablePorts.length) {
      console.warn(`Not enough motors connected. Need ${identities.length}, found ${availablePorts.length}`);
      return {};
    }
    
    // Create mappings
    const assignments = {};
    identities.forEach((identity, index) => {
      const port = availablePorts[index];
      assignments[identity] = port;
      this.identityToPortMap[identity] = port;
      this.portToIdentityMap[port] = identity;
    });
    
    return assignments;
  }
  
  /**
   * Get port for a semantic motor identity
   * 
   * @param {string} identity - Semantic identity (e.g., "left")
   * @returns {string|null} Port letter or null if not found
   */
  getPort(identity) {
    return this.identityToPortMap[identity] || null;
  }
  
  /**
   * Get semantic identity for a motor port
   * 
   * @param {string} port - Port letter
   * @returns {string|null} Semantic identity or null if not found
   */
  getIdentity(port) {
    return this.portToIdentityMap[port] || null;
  }
  
  /**
   * Get all defined motor identities
   * 
   * @returns {Object} Map of identities to ports
   */
  getIdentities() {
    return this.identityToPortMap;
  }
  
  /**
   * Get all assigned ports
   * 
   * @returns {Object} Map of ports to identities
   */
  getPorts() {
    return this.portToIdentityMap;
  }
  
  /**
   * Get the properties of a motor identity from its definition
   * 
   * @param {string} identity - Identity key
   * @returns {Object} Properties from the identity definition
   */
  getIdentityProperties(identity) {
    return this.identityDefinitions[identity] || {};
  }
  
  /**
   * Clear all identity mappings
   */
  clear() {
    this.identityToPortMap = {};
    this.portToIdentityMap = {};
    this.identityDefinitions = {};
  }
}

// Create singleton instance
const motorIdentityManager = new MotorIdentityManager();

export default motorIdentityManager; 