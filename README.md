# WildCatCode ---> WildCat Web

## Educational Programming Environment with Executive Function Skill Scaffolding

WildCat Web is a specialized programming education application designed specifically for executing functioning skills practice. The application provides an accessible interface for controlling LEGO Spike Prime robots through a visually engaging, customizable user interface with multiple reading levels, and clear visual communication.

## Key Features

-   **Visual Programming Interface**: visual programming tool with immediate feedback and sequential execution
-   **Accessibility & UDL Considerations**:
    -   Five reading levels from icon-only to complex text
    -   Text-to-speech with customizable robot voices
    -   High contrast mode and dyslexia-friendly fonts
    -   Visual hint system requiring no reading ability
-   **Robot Control**: Direct Bluetooth connectivity to LEGO Spike Prime robots
-   **Mission System**: Guided learning experiences with structured tasks and progression
-   **Multi-Sensory Learning**: Visual, auditory, and physical (robot) feedback paths
-   **Extensive Customization**: Adjust language, reading level, theme, and accessibility settings

## Getting Started

### Prerequisites

-   Node.js (v16+)
-   Bluetooth-enabled computer with WebBLE support
-   Chrome or Edge browser (for best WebBLE compatibility)
-   LEGO Spike Prime robot (optional - the app has a simulation mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/tuftsceeo/wildcat-code.git
cd wildcatweb

# Install dependencies
npm install

# Start the development server
npm run start
```

> **Note on WebBLE**: This application requires Web Bluetooth API support, which is available in Chrome and Edge browsers.

## Application Architecture

The application consists of three main panels:

-   **Run Menu** (left): Navigation between program slots and execution
-   **Code Track** (center): Visualization of the current instruction
-   **Command Panel** (right): Interface for creating and configuring instructions

The architecture is built around React contexts for state management:

-   **CustomizationContext**: Manages user preferences (reading level, language, theme)
-   **MissionContext**: Handles mission system and guided tasks
-   **BLEContext**: Manages Bluetooth connectivity and device state

## Core Concepts

### Program Structure

Programs in WildCat Web consist of **slots** (numbered positions) that contain **instructions**. Each instruction has:

-   **Type**: `action` or `input`
-   **Subtype**: Specific control type (e.g., `motor`, `time`, `button`)
-   **Configuration**: Parameters for the instruction (e.g., speed, port, seconds)

### Instruction Types

-   **Motor Instructions**: Control motor speed and direction
-   **Timer Instructions**: Wait for specific durations
-   **Button Instructions**: Wait for button/sensor input
-   **Stop Instruction**: End program execution

### Mission System

The mission system provides guided learning experiences:

-   **Mission**: Complete guided learning experience with defined objectives
-   **Task**: Single objective within a mission
-   **Sandbox Mode**: Free exploration without specific objectives

## Technologies Used

-   **Frontend**: React.js with hooks and context
-   **Styling**: CSS modules with design token system
-   **Bluetooth Communication**: Web Bluetooth API
-   **Code Generation**: JavaScript-based Python code generator
-   **Internationalization**: Custom translation system with reading levels

## Development

### Bluetooth Troubleshooting

-   Ensure your browser supports Web Bluetooth API
-   Check browser Bluetooth permissions
-   Verify the robot is powered on and in range
-   On Windows, ensure the browser has permission to use Bluetooth in system settings

## Accessibility Focus

WildCat Web was designed with specific accommodations for students with autism:

-   **Multiple Reading Levels**: From icon-only to complex text for diverse reading abilities
-   **Visual Communication**: Using consistent icons, colors, and animations
-   **Predictable UI**: Consistent layout and interaction patterns
-   **Sensory Considerations**: Options to reduce motion and sounds
-   **Concrete Representations**: Base-ten blocks for time, animal icons for speed

## Project Structure

```
wildcatweb/
├── src/
│   ├── App.js                          # Main application component
│   ├── assets/                         # Images, icons, and other static assets
│   ├── code-generation/                # Python code generation utilities
│   ├── common/                         # Shared utilities and components
│   ├── context/                        # Application-wide context providers
│   ├── features/                       # Feature-specific components and logic
│   │   ├── bluetooth/                  # Bluetooth connectivity
│   │   ├── commandPanel/               # Command configuration interface
│   │   ├── codeTrack/                  # Code visualization and testing
│   │   ├── missions/                   # Mission system and guided learning
│   │   ├── runMenu/                    # Program navigation and execution
│   │   └── settings/                   # User preferences and customization
│   ├── themes/                         # Design tokens and theme definitions
│   └── translations/                   # Internationalization and reading levels
└── public/                             # Static assets and entry point
```
