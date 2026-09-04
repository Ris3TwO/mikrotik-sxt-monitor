// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! Binary entry point for the desktop application.

/// Launches the Tauri runtime by delegating execution to the core application library.
fn main() {
    oncoders_mikrotik_noc_lib::run()
}
