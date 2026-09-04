//! MikroTik RouterOS API integration module.
//!
//! Provides the REST API client for HTTPS queries and the background poller engine.

pub mod client;
pub mod poller;

pub use client::MikrotikClient;
pub use poller::spawn_poller;
