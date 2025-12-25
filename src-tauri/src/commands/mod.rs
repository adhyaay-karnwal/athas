// Domain-organized command modules
pub mod ai;
pub mod database;
pub mod development;
pub mod editor;
pub mod hardware;
pub mod project;
pub mod ui;
pub mod vcs;
pub mod viewer;

// Standalone modules (not domain-specific)
pub mod extensions;
pub mod fuzzy;

// Re-export all commands from domain modules
pub use ai::*;
pub use database::*;
pub use development::*;
pub use editor::*;
pub use hardware::*;
// Re-export standalone modules
pub use extensions::*;
pub use fuzzy::*;
pub use project::*;
pub use ui::*;
pub use vcs::*;
pub use viewer::*;
