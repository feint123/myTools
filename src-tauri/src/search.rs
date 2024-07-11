use std::{fs, path::{Path, PathBuf}, sync::{Arc, Mutex}};
use lazy_static::lazy_static;
use log::info;
use tantivy::{collector::TopDocs, directory::MmapDirectory, doc, index, query::{self, QueryParser}, schema::{self, FieldValue, Schema, TextFieldIndexing, TextOptions, INDEXED, STORED}, Document, Index, TantivyDocument};
use tauri::{AppHandle, Manager};

use crate::source::ToolsSourceItem;

#[derive(Default)]
pub struct ToolsSearch {
    index_name: String,
    index: Option<Index>
}



lazy_static! {
    pub static ref TOOLS_INDEX: Arc<Mutex<ToolsSearch>> = Arc::new(Mutex::new(ToolsSearch::default()));
}


pub fn init_index(handle: &AppHandle) -> Result<(), String> {
    let mut tools_index = TOOLS_INDEX.lock().map_err(|err| err.to_string())?;
    let index = tools_index.init_index(handle)?;
    tools_index.index = Some(index);
    Ok(())
}

impl ToolsSearch {

    fn exists(&self, index_path: &PathBuf) -> Result<bool, String> {
        let mmDir = MmapDirectory::open(index_path).map_err(|e| e.to_string())?;
        return Index::exists(&mmDir).map_err(|e| e.to_string());
    }

    fn get_schema() -> Schema{
        let mut schema_builder = Schema::builder();

        let text_filed_indexing = TextFieldIndexing::default()
            .set_tokenizer("jieba")
            .set_index_option(tantivy::schema::IndexRecordOption::WithFreqsAndPositions);

        let text_options = TextOptions::default()
            .set_indexing_options(text_filed_indexing)
            .set_stored();


        schema_builder.add_i64_field("tool_id", STORED|INDEXED);
        schema_builder.add_text_field("title", text_options.clone());
        schema_builder.add_text_field("description", text_options.clone());
        schema_builder.add_text_field("content", text_options.clone());

        return schema_builder.build();
    }

    pub fn init_index(&self, handle: &AppHandle) -> Result<Index, String> {
        let mut app_data_dir = handle.path().app_data_dir().map_err(|err|err.to_string())?;
        if !app_data_dir.exists() {
            fs::create_dir(app_data_dir.as_path()).map_err(|err|err.to_string())?
        }
        let app_data_dir_string = app_data_dir.as_mut_os_string();
        app_data_dir_string.push(format!("/index/{}",self.index_name.clone()));
        let index_path_str = app_data_dir_string.to_str().unwrap();
        let index_path = PathBuf::from(index_path_str);
        if !index_path.exists() {
            fs::create_dir_all(index_path.as_path()).map_err(|err|err.to_string())?
        }
        let tokenizer = tantivy_jieba::JiebaTokenizer {};
        if self.exists(&index_path).map_err(|e| e.to_string())? {
            let index = Index::open(MmapDirectory::open(&index_path).map_err(|e| e.to_string())?)
                .map_err(|e| e.to_string())?;
            index.tokenizers().register("jieba", tokenizer);
            return Ok(index);
        }
      
        let schema = Self::get_schema();

        let index = tantivy::Index::create_in_dir(&index_path.as_path(), schema.clone())
            .map_err(|e| e.to_string())?;

        index.tokenizers().register("jieba", tokenizer);

        Ok(index)
    }

    pub fn update_index(&self, tool_items: &Vec<ToolsSourceItem>) -> Result<(), String>{
        if let Some(tools_index) = &self.index {
            let schema = Self::get_schema();
            let id = schema.get_field("tool_id").map_err(|err| err.to_string())?;
            let title = schema.get_field("title").map_err(|err| err.to_string())?;
            let description = schema.get_field("description").map_err(|err| err.to_string())?;
            let content = schema.get_field("content").map_err(|err| err.to_string())?;
            let mut index_writer = tools_index.writer(50_000_000).map_err(|err| err.to_string())?;
            for ele in tool_items {
                index_writer.add_document(doc!(
                    id => (ele.id as i64),
                    title => ele.title.as_str(),
                    description => ele.description.as_str(),
                    content => ele.content.as_str(),
                )).map_err(|err| err.to_string())?;
            }

            index_writer.commit().map_err(|err| err.to_string())?;
            
        }
        Ok(())
    }
    pub fn search(&self, keyword: String) -> Result<Vec<String>, String> {
        if let Some(tools_index) = &self.index {
            let mut result = vec![];
            let reader = tools_index.reader().map_err(|err| err.to_string())?;
            let searcher = reader.searcher();
            let schema = tools_index.schema();
            let title = schema.get_field("title").map_err(|err|err.to_string())?;
            let description = schema.get_field("description").map_err(|err|err.to_string())?;
            let content = schema.get_field("content").map_err(|err|err.to_string())?;
            let query_parser = QueryParser::for_index(tools_index, vec![title, description, content]);
            let query = query_parser.parse_query(keyword.as_str()).map_err(|err|err.to_string())?;

            let top_docs = searcher.search(&query, &TopDocs::with_limit(10)).map_err(|err|err.to_string())?;
            for (_score, doc_address) in top_docs {
                let retrieved_doc: TantivyDocument = searcher.doc(doc_address).map_err(|err|err.to_string())?;
                result.push(retrieved_doc.to_json(&schema))
            }
            return Ok(result);
        }

        Ok(vec![])
    }
}
