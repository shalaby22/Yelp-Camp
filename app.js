if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}



const express = require('express');
const path= require('path');
const mongoose=require('mongoose');
const session = require('express-session');
const flash = require('connect-flash')
const campground = require('./models/campground');
const User = require('./models/user');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./helpers/ExpressError');
const { log, error } = require('console');
const app = express();
const campRoutes = require('./routes/camps') ;
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');


app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbUrl)
  .then(()=>{
    console.log("mongo connedted");
  })
  .catch( (err)=>{
    console.log("error in mongo connection");
    console.log(err);
}) 
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'; 

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret
  }
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig={
  store,
  name: 'session',
  secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
    httpOnly:true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}

app.use(session(sessionConfig));         
app.use(flash());
app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))



const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.tiles.mapbox.com/",
  // "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.mapbox.com/",
  // "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
  // "https://api.mapbox.com/",
  // "https://a.tiles.mapbox.com/",
  // "https://b.tiles.mapbox.com/",
  // "https://events.mapbox.com/",
  "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djovseusp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/resources/logo.svg",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());  


app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');



  
  next();
})


app.use("/",userRoutes);
app.use("/camps",campRoutes);
app.use("/camps/:id/reviews",reviewRoutes);

app.get('/',(req,res)=>{
    res.render('home')
})



app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError('page not found', 404));
  
})


app.use((err,req,res,next) => {
  const {statusCode= 500} = err;
  if(!err.message) err.message = "errrrooorrrr, something went  wrong";
  res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})




// app.all(/(.*)/, (req, res, next) => {