//! Tauri IPC commands module.
//!
//! Exposes asynchronous and synchronous handlers invoked by the frontend layer
//! to manage MikroTik device polling, connections, and diagnostic tests.

pub mod mikrotik;

pub use mikrotik::*;
