# Wind - Hardware Integrated Development Environment (HIDE)

Wind is an AI-powered hardware engineering environment that transforms how firmware and hardware are created. Similar to how AI coding IDEs transformed software development, Wind brings AI automation to hardware engineering.

## Getting Started

### 1. Create a New Hardware Project

1. Open Wind
2. Use **File → Open Folder** to create/open a project
3. Organize your project structure:
   ```
   my-hardware-project/
   ├── firmware/          # Embedded firmware code
   ├── hardware/           # PCB designs, 3D models
   ├── documentation/      # Datasheets, reference manuals
   ├── tests/             # Hardware tests and simulations
   └── README.md
   ```

### 2. Add Hardware Documentation

The AI agent needs hardware documentation to work context-awarely:

1. Click the **CPU icon** in the left sidebar to open Hardware Docs panel
2. Click the **+** or **Upload** button
3. Add your hardware documents:
   - **Datasheets** (.pdf): Component specifications, register maps
   - **Reference Manuals**: MCU documentation, programming guides
   - **Schematics** (.sch, .kicad_sch): Circuit diagrams
   - **Company Knowledge**: Internal design docs, notes

Wind will automatically:
- Extract register maps and timing constraints
- Parse pin configurations and electrical specs
- Index the data for AI context

### 3. Write Firmware

Open or create firmware files in the code editor. Wind supports:
- C/C++ for embedded systems (ARM, AVR, RISC-V)
- Arduino sketches (.ino)
- Rust for embedded
- Assembly files

The AI agent will use your hardware documentation context to:
- Generate correct register initialization code
- Respect timing constraints
- Use proper pin configurations
- Handle interrupts and peripherals correctly

### 4. Work with PCB Designs

Open PCB design files to visualize and work with your hardware:
- **KiCad files** (.kicad_pcb)
- **Eagle files** (.brd)
- **STL/STEP/OBJ** files for 3D models

The PCB viewer shows:
- Component placements
- Net connections
- Layer views
- Trace information

### 5. Run Tests

Open test result files to see hardware test outcomes:
- Unit test results (.xml, .json)
- Integration test outputs
- Simulation results

The test viewer shows:
- Pass/fail status
- Test duration
- Timestamps
- Detailed output per test

## AI Agent Capabilities

Wind's AI agent specializes in hardware engineering:

### Firmware Development
- Generate drivers for peripherals (GPIO, UART, SPI, I2C, ADC, PWM)
- Write interrupt handlers with proper context saving/restoring
- Optimize code for memory and performance
- Implement communication protocols
- Debug firmware issues with hardware context

### Hardware Analysis
- Extract and interpret register maps from datasheets
- Analyze timing constraints and ensure code meets them
- Understand electrical specifications and pin configurations
- Identify compatibility issues between components

### PCB Design Support
- Validate component footprints and placements
- Check signal routing and layer assignments
- Analyze power distribution
- Review for DFM (Design for Manufacturability) issues

### Testing & Verification
- Create comprehensive test plans
- Generate test code for hardware validation
- Analyze test results and identify failures
- Suggest fixes for timing violations and race conditions

### Debugging
- Analyze register dumps and logic traces
- Debug at the bit level using extracted documentation
- Correlate firmware behavior with hardware expectations
- Provide targeted fixes for identified issues

## Using the AI Chat

### Hardware-Aware Context

The AI agent automatically includes:
- Hardware documentation context (register maps, timing, pinouts)
- Firmware file contents
- PCB design information
- Test results

Just describe what you need:

```
"Generate a UART driver for STM32F103 that runs at 115200 baud with 8N1 configuration"
```

The AI will use the STM32 datasheet you've added to create correct code.

### Slash Commands

Type `/` to see hardware-specific commands:
- `/extract_registers` - Extract register maps from documentation
- `/analyze_timing` - Analyze timing constraints
- `/generate_firmware` - Generate firmware for hardware
- `/debug_hardware` - Debug hardware issues
- `/validate_pcb` - Validate PCB design
- `/create_test` - Create hardware tests
- `/optimize_power` - Analyze power consumption
- `/verify_constraints` - Verify design meets constraints

### Session Modes

Switch modes to focus the AI agent:
- **Firmware Development** - Focus on embedded code
- **Hardware Design** - Focus on PCB and components
- **Testing & Verification** - Focus on test creation
- **Debugging** - Focus on fixing issues
- **Full-Stack Hardware** - Orchestrate across all domains

## Project Structure Best Practices

```
hardware-project/
├── firmware/
│   ├── src/
│   ├── inc/
│   ├── drivers/           # Peripheral drivers
│   ├── peripherals/        # Peripheral initialization
│   └── CMakeLists.txt
├── hardware/
│   ├── pcb/
│   │   ├── schematic/
│   │   └── layout/
│   ├── mechanical/
│   │   └── 3d-models/
│   └── bom/
├── documentation/
│   ├── datasheets/
│   ├── reference-manuals/
│   ├── schematics/
│   └── internal/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── simulation/
└── README.md
```

## Tips

1. **Always add documentation** - The AI agent needs datasheets and reference manuals to write correct code
2. **Use slash commands** - They guide the AI to focus on specific hardware tasks
3. **Review extracted data** - Check the Hardware Docs panel to verify data was extracted correctly
4. **Iterate with AI** - The agent learns from your project structure and can improve suggestions
5. **Validate designs** - Use `/validate_pcb` before manufacturing
6. **Test thoroughly** - The AI can help create comprehensive tests

## Troubleshooting

### AI not using documentation
- Ensure documents are added to the Hardware Docs panel
- Check that documents show "Extracted" status
- Verify the document type is correct (datasheet vs reference manual)

### PCB viewer not loading
- Check file format is supported (.kicad_pcb, .brd)
- Ensure the file path is correct
- Try opening a different viewer (3D model) to isolate the issue

### Test results not showing
- Verify test output format (JSON, XML supported)
- Check file path points to correct test results
- Ensure tests have completed before opening results

## Additional Resources

- **Keyboard Shortcuts**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) for command palette
- **Settings**: Configure AI provider, themes, and editor preferences
- **Extensions**: Install language servers for syntax highlighting and code completion
