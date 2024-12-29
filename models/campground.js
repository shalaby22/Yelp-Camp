const mongoose=require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;



const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };


const CampGroundSchema=new Schema({
    title:String,
    images: [ImageSchema],
    geometry: {
        type: {
            type:String,
            enum: ['Point'],
            required:true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price:Number,
    description:String,
    location:String,
    author: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]  
},opts);

CampGroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href = "/camps/${this.id}">${this.title}</a>` ;
});

CampGroundSchema.post('findOneAndDelete',async function (doc) {
    if(doc){
        await review.deleteMany({
            _id:  {
                $in: doc.reviews
            }
        })
    }
    
})
 



module.exports = mongoose.model('CampGround', CampGroundSchema)