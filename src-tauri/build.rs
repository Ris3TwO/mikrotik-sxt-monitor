//! Build script for Cargo compilation pipeline.
//!
//! Triggers Tauri code generation, IPC interface generation, and native platform bindings
//! prior to compiling the main crate binaries.

/// Executes the standard Tauri build script pipeline.
fn main() {
    tauri_build::build()
}
