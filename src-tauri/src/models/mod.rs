//! Domain model definitions for application state and API payloads.
//!
//! Re-exports modules representing data schemas mapped from MikroTik REST endpoints,
//! system configuration, and UI status payloads.

pub mod mikrotik;

pub use mikrotik::*;
