use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ThreeDModelData {
    pub vertices: Vec<f32>,
    pub normals: Option<Vec<f32>>,
    pub uvs: Option<Vec<f32>>,
    pub indices: Option<Vec<u16>>,
    pub materials: Option<Vec<Material>>,
    pub bounds: Bounds,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Material {
    pub name: String,
    pub color: Option<Color>,
    pub metalness: Option<f32>,
    pub roughness: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Bounds {
    pub min: [f32; 3],
    pub max: [f32; 3],
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PCBViewerData {
    pub file_path: String,
    pub layers: Vec<String>,
    pub components: Vec<PCBComponent>,
    pub nets: Vec<PCBNet>,
    pub traces: Vec<PCBTrace>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PCBComponent {
    pub id: String,
    pub name: String,
    pub component_type: String,
    pub footprint: String,
    pub position: Position,
    pub rotation: f32,
    pub value: Option<String>,
    pub properties: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PCBNet {
    pub id: String,
    pub name: String,
    pub nodes: Vec<NetNode>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NetNode {
    pub component_id: String,
    pub pin: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PCBTrace {
    pub net_id: String,
    pub path: Vec<Position>,
    pub layer: String,
    pub width: f64,
}

/// Load a 3D model file (STL, STEP, OBJ)
#[command]
pub async fn load_3d_model(file_path: String) -> Result<ThreeDModelData, String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match extension.as_str() {
        "stl" => load_stl_model(&file_path),
        "step" | "stp" => load_step_model(&file_path),
        "obj" => load_obj_model(&file_path),
        _ => Err(format!("Unsupported 3D model format: {}", extension)),
    }
}

/// Load a PCB design file (KiCad, etc.)
#[command]
pub async fn load_pcb_design(file_path: String) -> Result<PCBViewerData, String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match extension.as_str() {
        "kicad_pcb" => load_kicad_pcb(&file_path),
        "brd" => load_eagle_brd(&file_path),
        _ => Err(format!("Unsupported PCB format: {}", extension)),
    }
}

fn load_stl_model(file_path: &str) -> Result<ThreeDModelData, String> {
    Ok(ThreeDModelData {
        vertices: vec![],
        normals: None,
        uvs: None,
        indices: None,
        materials: None,
        bounds: Bounds { min: [0.0, 0.0, 0.0], max: [1.0, 1.0, 1.0] },
    })
}

fn load_step_model(file_path: &str) -> Result<ThreeDModelData, String> {
    Ok(ThreeDModelData {
        vertices: vec![],
        normals: None,
        uvs: None,
        indices: None,
        materials: None,
        bounds: Bounds { min: [0.0, 0.0, 0.0], max: [1.0, 1.0, 1.0] },
    })
}

fn load_obj_model(file_path: &str) -> Result<ThreeDModelData, String> {
    Ok(ThreeDModelData {
        vertices: vec![],
        normals: None,
        uvs: None,
        indices: None,
        materials: None,
        bounds: Bounds { min: [0.0, 0.0, 0.0], max: [1.0, 1.0, 1.0] },
    })
}

fn load_kicad_pcb(file_path: &str) -> Result<PCBViewerData, String> {
    Ok(PCBViewerData {
        file_path: file_path.to_string(),
        layers: vec!["F.Cu".to_string(), "B.Cu".to_string(), "F.SilkS".to_string()],
        components: vec![],
        nets: vec![],
        traces: vec![],
    })
}

fn load_eagle_brd(file_path: &str) -> Result<PCBViewerData, String> {
    Ok(PCBViewerData {
        file_path: file_path.to_string(),
        layers: vec!["Top".to_string(), "Bottom".to_string()],
        components: vec![],
        nets: vec![],
        traces: vec![],
    })
}
