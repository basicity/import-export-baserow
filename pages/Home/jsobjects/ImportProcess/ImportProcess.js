export default {
	rows: [],
	new_ids: [],
	fields_to_import: [],
	database_id: '',
	current_status: '' ,
	GetData (){
		const file_data = JSON.parse(FileImport.files[0].data) 
		this.rows = file_data.tables.map(t => {
			
			// get indexes of fields that are formula, lookup or rollup fields
			const indexes = [];
			t.fields.forEach((f,i) => {
				if(f.type === 'formula' || f.type === 'rollup' || f.type === 'lookup' || f.type === "created_on"){
					indexes.push(i + 2);
				}
			})
			
			t.data.forEach((row,i) => {
				let count = 0;
				for(let col in row){
					if(indexes.includes(count)){
						delete row[col];
					}
					count++;
				}

			})
			return {id: this.new_ids.filter(i => i.original_table_id == t.id)[0], data: t.data}
			
		});
	},
	async StartImport () {
		// create database, tables and fields
		this.current_status = 'creating database, tables and fields...'
		await TriggerStartImport.run()
		this.fields_to_import = TriggerStartImport.data.map(f => f.json.field)
		// store the new generated id's
		this.new_ids = TriggerStartImport.data.map(f => {
			return {new_table_id: f.json.table_id, original_table_id: f.json.original_table}
		})
		this.database_id = TriggerStartImport.data[0].json.new_database;
		
		// update the field types
		this.current_status = 'updating fields to their corresponding type... (this can take a while)'
		const update_response = await TriggerUpdateFields.run();
		this.fields_to_import = update_response;
		
		while(!this.fields_to_import[0].json.status){
			console.log('fields to import')
			console.log(this.fields_to_import)
			this.current_status = 'fixing formula fields... (this can take a while)'
			const update_response = await TriggerUpdateFields.run();
			console.log('update response')
			console.log(update_response);
			this.fields_to_import = update_response;
		}
		
		this.current_status = 'Imported table structure, start with data...'
		this.GetData();
		await TriggerDataImport.run();
		console.log(TriggerDataImport.data);
		this.current_status = 'Imported tabled data. Import is completed';
	}
}