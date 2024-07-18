use std::{fs::File, io::Write};

use tauri::{AppHandle, Manager};
use uuid::Uuid;

pub fn download_file(url: String, handle: &AppHandle) -> Result<String, String> {
    let mut app_data_path = handle.path().app_data_dir().map_err(|err| err.to_string())?;
    let app_data_dir_string = app_data_path.as_mut_os_string();
    app_data_dir_string.push(format!("/temp-{}.json", Uuid::new_v4().to_string()));
    let temp_file_path = app_data_dir_string.to_str().unwrap();
    let mut file = File::create(temp_file_path).map_err(|err| err.to_string())?;

    let resp = reqwest::blocking::get(url).map_err(|err| err.to_string())?;
    if resp.status().is_success() {
        let bytes = resp.bytes().map_err(|err| err.to_string())?;
        file.write_all(&bytes).map_err(|err| err.to_string())?;
    }
    Ok(temp_file_path.clone().to_string())
}