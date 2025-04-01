# Motor Identity System

This document explains the semantic motor identity system used in WildCat missions.

## Overview

The motor identity system allows mission creators to refer to motors by meaningful names like "left motor" instead of physical port letters like "port A". This enables:

- Port-agnostic mission definitions
- Consistent motor references across tasks
- Flexible hardware configuration for users

## Key Concepts

### Semantic Motor Identities

In mission definitions, motors are identified by semantic names:

```javascript
motorIdentities: {
  "left": { role: "drive wheel" },
  "right": { role: "arm" }
}
```

### Dynamic Port Assignment

The system automatically assigns connected ports to semantic identities at runtime. For example:

- If motors are connected to ports A and B:
  - "left" might be assigned to port A
  - "right" might be assigned to port B

- If motors are connected to ports C and F:
  - "left" might be assigned to port C
  - "right" might be assigned to port F

### User Interface

Users only see and interact with port letters in the UI. The semantic identities are only used internally for mission definitions and validation.

## Using Motor Identities in Missions

### Motor Identity Definition

Define the semantic identities your mission needs:

```javascript
motorIdentities: {
  "left": { description: "Left drive wheel" },
  "right": { description: "Right drive wheel" }
}
```

### Task Configuration

Target specific motors in tasks using the `targetMotorIdentity` property:

```javascript
{
  taskId: "configure_left_motor",
  type: "MOTOR_CONFIGURATION",
  targetMotorIdentity: "left",
  // ...
}
```

### Instruction Templates

Reference specific motors in instructions using placeholders:

- `{leftMotorPort}` - Will be replaced with the port letter (e.g., "A")
- `{rightMotorPort}` - Will be replaced with the port letter (e.g., "B")

## Guidelines

1. Never reference specific port letters in mission definitions
2. Use semantic identities for tasks that target specific motors
3. Use placeholder syntax in instructions
4. Keep UI displays and references port-based

## Implementation Details

### MotorIdentityManager

The `MotorIdentityManager` class handles the mapping between semantic identities and physical ports:

```javascript
// Get port for a semantic identity
const port = motorIdentityManager.getPort("left");

// Get semantic identity for a port
const identity = motorIdentityManager.getIdentity("A");

// Get all defined motor identities
const identities = motorIdentityManager.getIdentities();

// Get all assigned ports
const ports = motorIdentityManager.getPorts();
```

### Task Validation

Motor configuration tasks can validate against specific motor identities:

```javascript
{
  taskId: "configure_left_motor",
  type: "MOTOR_CONFIGURATION",
  targetMotorIdentity: "left",
  motorRequirements: [
    {
      speedRange: [300, 1000],
      direction: "clockwise"
    }
  ]
}
```

### Instruction Processing

The instruction templating system automatically converts semantic references to port letters:

```javascript
// Input: "Make Motor {leftMotorPort} spin clockwise"
// Output: "Make Motor A spin clockwise"
```

## Best Practices

1. **Mission Definitions**
   - Use semantic identities for all motor references
   - Include descriptive properties in identity definitions
   - Avoid hardcoding port letters

2. **Task Configuration**
   - Use `targetMotorIdentity` for tasks that need specific motors
   - Keep motor requirements focused on behavior, not ports
   - Use clear, descriptive identity names

3. **Instructions**
   - Use the appropriate placeholder syntax
   - Keep instructions clear and user-friendly
   - Test instructions with different port assignments

4. **Error Handling**
   - Handle cases where motors aren't connected
   - Provide clear error messages for missing motors
   - Log identity-to-port mapping changes

## Example Mission

Here's a complete example of a mission using motor identities:

```javascript
{
  missionId: "two_motor_mission",
  title: "Two Motor Challenge",
  description: "Control two motors with different directions and speeds",
  
  motorIdentities: {
    "left": {
      role: "drive wheel",
      position: "left side"
    },
    "right": {
      role: "drive wheel",
      position: "right side"
    }
  },
  
  tasks: [
    {
      taskId: "configure_left_motor",
      type: "MOTOR_CONFIGURATION",
      targetMotorIdentity: "left",
      motorRequirements: [
        {
          speedRange: [300, 1000],
          direction: "clockwise"
        }
      ],
      instruction: "Make Motor {leftMotorPort} spin clockwise"
    },
    {
      taskId: "configure_right_motor",
      type: "MOTOR_CONFIGURATION",
      targetMotorIdentity: "right",
      motorRequirements: [
        {
          speedRange: [300, 1000],
          direction: "countercw"
        }
      ],
      instruction: "Make Motor {rightMotorPort} spin counter-clockwise"
    }
  ]
}
```

## Troubleshooting

Common issues and solutions:

1. **Motor Not Detected**
   - Check if the motor is properly connected
   - Verify the port is working
   - Ensure the motor identity is defined in the mission

2. **Wrong Motor Configuration**
   - Verify the target motor identity is correct
   - Check if the port assignment is correct
   - Review the motor requirements

3. **Instruction Placeholder Issues**
   - Use the correct placeholder syntax
   - Ensure the motor identity exists
   - Check if the port is assigned

4. **Task Validation Failures**
   - Review the motor requirements
   - Check the port assignments
   - Verify the motor configuration 