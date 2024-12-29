const Review = require('../models/review');
const campground = require('../models/campground');


module.exports.createReview = async(req,res)=>{

  const camp = await campground.findById(req.params.id);
  const nreview = new Review(req.body.review);
  nreview.author = req.user._id;
  camp.reviews.push(nreview);
  await nreview.save();
  await camp.save();
  
  req.flash('success','created a new  review!');
  res.redirect(`/camps/${camp._id}`);

}


module.exports.deleteReview = async(req,res)=>{
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id,{ $pull: {reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Deleted the review successfully');
    res.redirect(`/camps/${id}`);
  }
