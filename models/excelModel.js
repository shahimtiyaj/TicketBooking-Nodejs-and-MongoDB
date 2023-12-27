var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var excelSchema = new Schema({
	cn:String,
	pol:String,
	pod:String,
	tos:String,
	eta_pod: String,
	cargo_type: String,
	frt_all_in: String,
	carrier: String,
	vessel_name:String
  });
  
  var excelModel = mongoose.model('excelModel',excelSchema);
   module.exports = excelModel;