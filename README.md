# NOC Access Gateway

High-performance desktop application designed for network infrastructure monitoring and management, connecting directly to devices via the **MikroTik RouterOS REST API**. Built with modern web technologies and a native core optimized for Network Operations Center (NOC) environments.

## Key Features

- **Real-time Monitoring**: Visualization of wireless link metrics, stability (drops), interface synchronization, physical rates (RX/TX), RSSI, and transmission quality (CCQ).
- **Direct MikroTik Connection**: Native integration with the RouterOS REST API for fast communication without heavy intermediaries.
- **Internationalization (i18n)**: Native multi-language support (English / Spanish) with automatic system detection and local preference persistence via `localStorage`.
- **Security & Persistence**: Secure local storage options for network device access credentials.
- **Auto-Updates**: Ready for seamless deployments using Tauri's automated update system (`tauri-plugin-updater`).

## Tech Stack

- **Native Core / Backend**: [Rust](https://www.rust-lang.org/) (managing performance, type safety, and the network query engine).
- **Desktop Framework**: [Tauri v2](https://tauri.app/) (lightweight and low resource consumption compared to traditional Chromium-based alternatives).
- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API) along with [TypeScript](https://www.typescriptlang.org/).
- **Styles & UI**: [Tailwind CSS](https://tailwindcss.com/) with a custom high-contrast color palette for dark NOC environments.
- **Internationalization**: `vue-i18n`.

## Prerequisites

Make sure you have the following tools installed on your development environment before cloning the repository:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [pnpm](https://pnpm.io/) (recommended package manager)
- [Rust toolchain](https://rustup.rs/) (cargo and rustc)
- System dependencies required by Tauri (WebKitGTK on Linux, Xcode Command Line Tools on macOS, or MSVC Build Tools on Windows).

## Installation & Development

1.  Clone the repository:

    Bash

        git clone https://github.com/Ris3TwO/mikrotik-sxt-monitor.git
        cd mikrotik-sxt-monitor

2.  Install project dependencies:

    Bash

        pnpm install

3.  Run the application in development mode (Tauri + Vite):

    Bash

        pnpm tauri dev

## Build & Production

To generate native, optimized installable binaries for your operating system:

Bash

    pnpm tauri build

_Note: To enable automatic update signing, make sure to configure the `TAURI_SIGNING_PRIVATE_KEY` environment variable in your build pipeline._

Developed by **On Coder's** • Expertise & Connection
