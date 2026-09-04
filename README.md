<div align="center">

# On Coder's MikroTik NOC

An enterprise-grade, cross-platform desktop client designed for real-time monitoring and telemetry of MikroTik RouterOS infrastructure.

[![Tauri](https://img.shields.io/badge/Tauri-v2-blue?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-1.75+-orange?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-v3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## Overview

**On Coder's MikroTik NOC** is a lightweight, high-performance Network Operations Center client built for network engineers and WISP administrators. It delivers low-latency device status checks, wireless link analysis, and bandwidth metrics directly from MikroTik hardware using secure **HTTPS / RouterOS REST API** queries.

Engineered with a clean Rust/Tauri architecture, it eliminates heavy Chromium overhead to provide a minimal memory footprint, ideal for multi-monitor NOC environments and low-resource workstations.

---

## Key Features

- **Real-Time Telemetry & Metrics:** Live monitoring of wireless link health, packet drop rates, interface synchronization, RX/TX throughput, RSSI, and CCQ quality.
- **Native Rust Query Engine:** Direct HTTPS communications via custom Rust commands for optimal concurrency and thread safety.
- **RouterOS Requirements & REST API Support:** Native integration with RouterOS v7 REST endpoints, removing legacy API binary protocol constraints.
- **Internationalization (i18n):** Built-in English and Spanish localization with automatic OS language detection and user preference persistence.
- **Dark NOC Theme:** High-contrast, dark-mode user interface tailored for continuous monitoring environments.
- **Automated Updates:** Secure in-app auto-updates using `tauri-plugin-updater` with Minisign public key verification.

---

## System Architecture

The application adopts a decoupled desktop architecture designed for safety and responsiveness:

```text
┌────────────────────────────────────────────────────────┐
│                   Vue 3 + TS Frontend                  │
│   (Pinia State, Lucide Icons, Chart Rendering, i18n)   │
└───────────────────────────┬────────────────────────────┘
                            │  Tauri IPC Commands
┌───────────────────────────▼────────────────────────────┐
│                    Rust Core (Tauri v2)                │
│   (Modularized App State, Config, Command Handlers)    │
└───────────────────────────┬────────────────────────────┘
                            │  HTTPS / REST API
┌───────────────────────────▼────────────────────────────┐
│                MikroTik RouterOS Device                │
└────────────────────────────────────────────────────────┘
```

RouterOS Requirements
---------------------

To enable successful connection with target MikroTik devices:

*   **RouterOS Version:** RouterOS **v7.1.1** or higher (REST API engine enabled by default).
    
*   **HTTP/HTTPS Service:** The `www-ssl` (or `www`) service must be active under IP Services:
    
    
        /ip service set www-ssl disabled=no port=443
    
*   **User Permissions:** A dedicated user account with at least `read` and `rest-api` policies:
    
        /user group add name=noc-monitor policy=read,rest-api
        /user add name=noc-user group=noc-monitor password=YOUR_SECURE_PASSWORD
    

Prerequisites
-------------

Ensure your development environment meets the following requirements:

*   **Node.js:** v18.0.0 or higher
    
*   **pnpm:** v8.0.0+ (recommended package manager)
    
*   **Rust toolchain:** `rustc` and `cargo` (latest stable)
    
*   **System Build Tools:** Follow the official [Tauri v2 Prerequisites Guide](https://v2.tauri.app/start/prerequisites/) for your OS (Windows C++ Build Tools, Xcode CLI Tools on macOS, or WebKitGTK on Linux).
    

Getting Started
---------------

### 1\. Clone the repository

Bash

    git clone [https://github.com/Ris3TwO/on-coders-mikrotik-noc.git](https://github.com/Ris3TwO/on-coders-mikrotik-noc.git)
    cd on-coders-mikrotik-noc

### 2\. Install dependencies

Bash

    pnpm install

### 3\. Run in development mode

Bash

    pnpm tauri dev

Build & Quality Assurance
-------------------------

### Run Code Checks and Tests

Execute full frontend linting, unit tests, and Rust integration tests:

Bash

    pnpm check:all

### Build Production Binaries

Generate optimized native executables and installers (`.msi`, `.exe`, `.deb`, `.AppImage`):

Bash

    pnpm tauri build

The output bundles will be located in `src-tauri/target/release/bundle/`.

> **Note:** For automated CI/CD releases, ensure the `TAURI_SIGNING_PRIVATE_KEY` environment variable is defined for installer signing.

License
-------

Distributed under the MIT License. See `LICENSE` for details.

Developed by **On Coder's** • _Expertise & Connection_

---