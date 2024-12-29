const campground = require('../models/campground');
const {cloudinary} = require("../cloudinary")

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;



module.exports.index = async(req,res)=>{
    const camps = await campground.find({});
    res.render('campgrounds/index',{camps})
}

module.exports.renderNewForm = (req,res)=>{
  res.render('campgrounds/new')   
}

module.exports.createCampground = async(req,res)=>{

  const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
  const newCamp= new campground(req.body);
  newCamp.geometry = geoData.features[0].geometry;


  newCamp.images = req.files.map(f => ({url: f.path, filename:f.filename}));
  newCamp.author = req.user._id;
  await newCamp.save();
   req.flash('success','succesully made a new campp');
  res.redirect(`/camps/${newCamp._id}`);   
}


module.exports.showCampground= async(req,res)=>{
  const camps = await campground.findById(req.params.id).populate({
    path:'reviews',
    populate:{
      path:'author'
    }
  }).populate('author');
  console.log(camps);
  if(!camps){
    req.flash('error',"can't find that camp");
    return res.redirect('/camps');
  }
  res.render('campgrounds/show',{camps})
}



module.exports.renderEditForm = async(req,res)=>{
  const camps = await campground.findById(req.params.id);
  if(!camps){
    req.flash('error',"can't find that camp");
    return res.redirect('/camps');
  }

  res.render('campgrounds/edit',{camps})
}


module.exports.updateCampground=async(req,res)=>{
  
    const campUpdated = await campground.findByIdAndUpdate(req.params.id,{...req.body});
    // console.log(req.body);
    const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
    campUpdated.geometry = geoData.features[0].geometry;

    const newImages= req.files.map(f => ({url: f.path, filename:f.filename}));
    campUpdated.images.push(...newImages);
    await campUpdated.save();
    if(req.body.deleteImages){
      await campUpdated.updateOne({$pull:{images:{filename: {$in:req.body.deleteImages}} }})
      for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename);
      }
    }

    req.flash('success','successfully updated campgroound');
    res.redirect(`/camps/${req.params.id}`);
}

module.exports.deleteCampground = async(req,res)=>{
    await campground.findByIdAndDelete(req.params.id);
    req.flash('success','Deleted the camp successfully');
    res.redirect(`/camps`);
  }