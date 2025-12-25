use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub version: Option<String>,
    pub revision: Option<String>,
    pub pages: Option<u32>,
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
    pub description: Option<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtractedData {
    pub register_maps: Option<Vec<RegisterMap>>,
    pub timing_constraints: Option<Vec<TimingConstraint>>,
    pub pinouts: Option<Vec<Pinout>>,
    pub electrical_specs: Option<Vec<ElectricalSpec>>,
    pub configurations: Option<Vec<Configuration>>,
    pub summary: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterMap {
    pub name: String,
    pub address: String,
    pub description: String,
    pub bit_width: u32,
    pub access: String,
    pub fields: Option<Vec<RegisterField>>,
    pub reset_value: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterField {
    pub name: String,
    pub bit_range: Vec<u32>,
    pub description: String,
    pub enum_values: Option<Vec<EnumValue>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EnumValue {
    pub value: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimingConstraint {
    pub name: String,
    pub parameter: String,
    pub min: Option<f64>,
    pub typ: Option<f64>,
    pub max: Option<f64>,
    pub unit: String,
    pub condition: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Pinout {
    pub pin_number: String,
    pub name: String,
    pub pin_type: String,
    pub description: Option<String>,
    pub function: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ElectricalSpec {
    pub parameter: String,
    pub min: Option<f64>,
    pub typ: Option<f64>,
    pub max: Option<f64>,
    pub unit: String,
    pub condition: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Configuration {
    pub name: String,
    pub description: String,
    pub settings: serde_json::Value,
}

/// Extract metadata from a hardware document file
#[command]
pub async fn extract_document_metadata(
    file_path: String,
    file_type: String,
) -> Result<DocumentMetadata, String> {
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
        "pdf" => extract_pdf_metadata(&file_path),
        "txt" | "csv" | "json" | "xml" => extract_text_metadata(&file_path),
        _ => Ok(DocumentMetadata {
            title: None,
            author: None,
            version: None,
            revision: None,
            pages: None,
            manufacturer: None,
            part_number: None,
            description: Some(format!("File: {}", path.file_name().and_then(|n| n.to_str()).unwrap_or("unknown"))),
            tags: vec![],
        }),
    }
}

/// Extract hardware data (registers, timing, etc.) from a document
#[command]
pub async fn extract_hardware_data(
    file_path: String,
    file_type: String,
) -> Result<ExtractedData, String> {
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
        "pdf" => extract_pdf_data(&file_path),
        "txt" | "csv" | "json" | "xml" => extract_text_data(&file_path),
        _ => Ok(ExtractedData {
            register_maps: None,
            timing_constraints: None,
            pinouts: None,
            electrical_specs: None,
            configurations: None,
            summary: None,
        }),
    }
}

fn extract_pdf_metadata(file_path: &str) -> Result<DocumentMetadata, String> {
    Ok(DocumentMetadata {
        title: Some("PDF Document".to_string()),
        author: None,
        version: None,
        revision: None,
        pages: None,
        manufacturer: None,
        part_number: None,
        description: Some("Hardware documentation PDF".to_string()),
        tags: vec![],
    })
}

fn extract_text_metadata(file_path: &str) -> Result<DocumentMetadata, String> {
    Ok(DocumentMetadata {
        title: Some("Text Document".to_string()),
        author: None,
        version: None,
        revision: None,
        pages: None,
        manufacturer: None,
        part_number: None,
        description: Some("Hardware documentation text file".to_string()),
        tags: vec![],
    })
}

fn extract_pdf_data(file_path: &str) -> Result<ExtractedData, String> {
    Ok(ExtractedData {
        register_maps: None,
        timing_constraints: None,
        pinouts: None,
        electrical_specs: None,
        configurations: None,
        summary: Some("PDF parsing would extract register maps, timing constraints, and other hardware data using PDF extraction libraries.".to_string()),
    })
}

fn extract_text_data(file_path: &str) -> Result<ExtractedData, String> {
    Ok(ExtractedData {
        register_maps: None,
        timing_constraints: None,
        pinouts: None,
        electrical_specs: None,
        configurations: None,
        summary: Some("Text file analysis would extract hardware data based on content structure.".to_string()),
    })
}
