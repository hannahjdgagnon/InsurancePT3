let express = require("express");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");
let app = express();
let session = require("express-session");
let passport = require("passport");
let passportLocal = require("passport-local");
let localStrategy = passportLocal.Strategy;
let flash = require("connect-flash");

//create a user model instance
let userModel = require("./models/user");
let User = userModel.User;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/InsuranceProject";

// Connect to MongoDB
console.log("MongoDB Connection String:", mongoURI);
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define claim schema (adjust fields as needed)
let claimSchema = new mongoose.Schema({
  title: String,
  description: String,
  // Add other fields as needed
});

let Claim = mongoose.model("Claim", claimSchema);

// set up express session
app.use(
  session({
    secret: "SomeSecret",
    saveUninitialized: false,
    resave: false,
  })
);

passport.use(User.createStrategy());

// serialize and deserialize the user info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//initializepassport
app.use(passport.initialize());
app.use(passport.session());

//initialize flash
app.use(flash());

//  the authentication route
const authRoute = require("./routes/auth");
app.use("/", authRoute);

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

// CRUD operations
// Routes
app.get("/", (req, res, next) => {
  res.render("home", {
    title: "Home",
    displayName: req.user ? req.user.displayName : "",
  });
});

app.get("/services", (req, res, next) => {
  res.render("services", {
    title: "Services",
    displayName: req.user ? req.user.displayName : "",
  });
});

app.get("/about", (req, res, next) => {
  res.render("about", {
    title: "About",
    displayName: req.user ? req.user.displayName : "",
  });
});

app.get("/claims", requireAuth, async (req, res, next) => {
  try {
    // Fetch all claims from the database
    const claims = await Claim.find();
    res.render("claims", {
      displayName: req.user ? req.user.displayName : "",
      claims,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Post new claim
app.post("/claims/submit", requireAuth, async (req, res, next) => {
  const { title, description } = req.body;
  const newClaim = new Claim({ title, description });

  try {
    await newClaim.save();
    res.redirect("/claims");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Post delete claim
app.post("/claims/delete/:id", requireAuth, async (req, res, next) => {
  const claimId = req.params.id;

  try {
    await Claim.findByIdAndDelete(claimId);
    res.redirect("/claims");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Get edit claim
app.get("/claims/edit/:id", requireAuth, async (req, res, next) => {
  const claimId = req.params.id;

  try {
    const claim = await Claim.findById(claimId);
    res.render("edit-claim", {
      displayName: req.user ? req.user.displayName : "",
      claim,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Post update claim
app.post("/claims/update/:id", requireAuth, async (req, res, next) => {
  const claimId = req.params.id;
  const { title, description } = req.body;

  try {
    await Claim.findByIdAndUpdate(claimId, { title, description });
    res.redirect("/claims");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/contact", requireAuth, (req, res, next) => {
  res.render("contact", {
    title: "Contact",
    displayName: req.user ? req.user.displayName : "",
  });
});

// Port
const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
