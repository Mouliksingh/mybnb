// app.js
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const methodOverride = methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const messageRouter = require("./routes/message.js");
const conciergeRouter = require("./routes/concierge.js");
const hostingRouter = require("./routes/hosting.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/mybnb";

async function main() {
  await mongoose.connect(dbUrl);
}

main().then(() => {
  console.log("Connected to MongoDB Atlas database");
}).catch((err) => {
  console.log("Database connection error:", err);
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.set("trust proxy", 1);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            user = new User({
              username: profile.displayName.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000),
              email: profile.emails[0].value,
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// API Routes
app.use("/api/listings", listingRouter);
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/messages", messageRouter);
app.use("/api/concierge", conciergeRouter);
app.use("/api/hosting", hostingRouter);
app.use("/api/auth", userRouter);

// Catch-all for missing API endpoints to return JSON instead of HTML
app.all("/api/*", (req, res, next) => {
  next(new ExpressError(404, "API Endpoint Not Found!"));
});

// Serve React Frontend static files
app.use(express.static(path.join(__dirname, "client/dist")));

// React Router SPA Fallback (serve index.html for all non-API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// Global Error-handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).json({ error: message });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`MERN Backend API server listening on port ${port}`);
});