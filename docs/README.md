# Wind Documentation

Wind is an AI-powered Hardware Integrated Development Environment (HIDE) that transforms hardware and firmware development.

## Documentation

### User Documentation

- **[Wind Hardware IDE Guide](wind-hardware-ide.md)** - Comprehensive guide for using Wind to develop hardware and firmware

### Developer Documentation

- **[Contributing Guide](../CONTRIBUTING.md)** - For developers contributing to Wind

## Quick Links

### Core Features

- **Hardware Documentation** - Add and manage datasheets, reference manuals, schematics
- **AI Hardware Agent** - Context-aware AI assistant for hardware engineering
- **3D Model Viewer** - View STL, STEP, OBJ files
- **PCB Viewer** - View and validate KiCad and Eagle designs
- **Test Result Viewer** - Analyze hardware test outputs
- **Firmware Development** - Write embedded firmware with AI assistance

## Getting Started

1. Read the [Wind Hardware IDE Guide](wind-hardware-ide.md) for an overview
2. Create a new hardware project folder
3. Add your hardware documentation (datasheets, reference manuals)
4. Start writing firmware or designing hardware with AI assistance

## Architecture

Wind is built with:
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
- **Backend**: Tauri (Rust 2024)
- **State Management**: Zustand with immer, persist, and selectors
- **Architecture**: Feature-based modular structure

## Hardware Support

Wind supports hardware engineering workflows including:
- Microcontroller programming (ARM Cortex-M, AVR, RISC-V)
- PCB design and validation (KiCad, Eagle)
- 3D modeling (STL, STEP, OBJ)
- Hardware testing and simulation
- Register-level debugging
- Timing constraint analysis
- Power optimization

## License

Wind is licensed under [AGPL-3.0](../LICENSE).
