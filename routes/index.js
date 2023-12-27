var express = require('express');
var router = express.Router();
var User = require('../models/user');
var excelModel = require('../models/excelModel');
//--------------------------------------------
const XLSX = require('xlsx');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });

// Now, you can use the 'upload' middleware in your router
router.get('/home', function (req, res, next) {
  res.render("home.ejs");
});

//------------------------------------------------

router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});

router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;

	if(!personInfo.email || !personInfo.username || !personInfo.phone ||  !personInfo.fax || !personInfo.address || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							phone:personInfo.phone,
							fax: personInfo.fax,
							address:personInfo.address,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				console.log("Done Login");
				req.session.userId = data.unique_id;
				console.log(req.session.userId);
				res.send({"Success":"Success!"});
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});


router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

//show edit page when click edit and render data to page wz it
router.get('/editExcel/:id', async (req, res) => {
    try {
        const excelId = req.params.id;
        const excelData = await excelModel.findById(excelId);

        if (!excelData) {
            return res.status(404).render('editExcel', { excelData: null });
        }

        return res.render('editExcel', { excelData });
    } catch (err) {
        console.error(err);
        return res.status(500).render('error', { message: 'Error fetching Excel data for edit' });
    }
});

  
router.post('/updateExcel/:id', async (req, res) => {
    try {
        const excelId = req.params.id;
        const updatedData = req.body; // Assuming req.body contains the updated Excel data

        const updatedExcel = await excelModel.findByIdAndUpdate(excelId, updatedData, { new: true });

        if (!updatedExcel) {
            return res.status(404).render('updateExcel', { message: 'Excel data not found for update' });
        }

        return res.render('updateExcel', { message: 'Excel data updated successfully', updatedExcel });
    } catch (err) {
        console.error(err);
        return res.status(500).render('error', { message: 'Error updating Excel data' });
    }
});


// Your existing route for deleting Excel data by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const excelId = req.params.id;
        const deletedExcel = await excelModel.findByIdAndDelete(excelId);

        if (!deletedExcel) {
            return res.status(404).render('delete', { userdata: 'Excel Data Not Found to Delete' });
        }

        return res.render('delete', { userdata: 'Successfully Deleted Excel Data' });
    } catch (err) {
        console.error(err); // Log the error for debugging purposes
        return res.status(500).render('delete', { userdata: 'Error Deleting Excel Data' });
    }
});


// Upload code: -----------------------------------------------------------------------------------------------
  
router.get('/homepass', (req, res) => {
	excelModel.find({}, (err, data) => {
	  if (err) {
		console.error('Error retrieving data:', err);
		res.render('home.ejs', { result: [] }); // Render with an empty array in case of an error
	  } else {
		if (data && data.length > 0) {
		  console.log('Data found:', data);
		  res.render('home.ejs', { result: data }); // Render with the fetched data
		} else {
		  console.log('No data found');
		  res.render('home.ejs', { result: [] }); // Render with an empty array if no data is found
		}
	  }
	});
  });
  
  
  router.post('/upload', upload.single('excel'), async (req, res) => {
	try {
	  const workbook = XLSX.readFile(req.file.path);
	  const sheetNames = workbook.SheetNames;
	  const dataToInsert = [];
  
	  for (let sheetName of sheetNames) {
		const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
		dataToInsert.push(...xlData);
	  }
  
	  const insertedData = await excelModel.insertMany(dataToInsert);
	  console.log('Data inserted:', insertedData);
	  
	  res.redirect('/');
	} catch (err) {
	  console.error(err);
	  res.status(500).send('Error occurred while processing the file.');
	}
  });

module.exports = router;