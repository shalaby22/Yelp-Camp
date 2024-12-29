const mongoose=require('mongoose');
const cities = require('./cities');
const {places , descriptors} = require('./seedHelpers')
const campground = require('../models/campground');




main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
  .then(()=>{
    console.log("mongo connedted");
  })
  .catch( (err)=>{
    console.log("error in mongo connection");
    console.log(err);
}) 
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const sample = function (arr){
    return arr[Math.floor(Math.random() * arr.length )];
}

const seedDB = async ()=>{

    await campground.deleteMany({});  

    for (let i =0; i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const camp = new campground({
            author: '676335ccdc0527439856af38',
            location :`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus eius provident, molestias laboriosam velit dolor similique! Quam saepe libero esse odit quaerat. Natus, unde? Est atque nemo modi hic a!',
            geometry: {
              type: 'Point',
              coordinates: [cities[random1000].longitude,cities[random1000].latitude ]
            },
            price:Math.floor((Math.random()*70)+10 ),
            images: [
              {
                url: 'https://res.cloudinary.com/djovseusp/image/upload/v1734981519/YelpCamp/klmiqeaoa2wdn9u8iiud.jpg',
                filename: 'YelpCamp/klmiqeaoa2wdn9u8iiud',
              },
              {
                url: 'https://res.cloudinary.com/djovseusp/image/upload/v1734981520/YelpCamp/sjb1p37d6my8nbc5bjts.jpg',
                filename: 'YelpCamp/sjb1p37d6my8nbc5bjts',
              }
            ]

            //image:`https://picsum.photos/400?random=${Math.random()}`
        })
        await camp.save();

        
    }

   
}

// campground.find()
// .then(users => {
//   console.log("Users found:", users);  // Logs the array of users
// })
// .catch(err => {
//   console.error("Error finding users:", err);
// });

seedDB().then(()=>{
    mongoose.connection.close();
} );


