import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { UserLoginType } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(new ApiError(404, "User does not exist"));
    }
  } catch (error) {
    done(
      new ApiError(500, `Error while deserializing the user: ${error.message}`)
    );
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
      //  console.log(profile);
        
        // Ensure profile.emails is available and has at least one email
        const email =
          (profile.emails && profile.emails[0] && profile.emails[0].value) ||
          "";
        if (!email) {
          return done(
            new ApiError(400, "No email associated with Google account"),
            null
          );
        }

        // Check if the user with the email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          if (existingUser.loginType !== UserLoginType.GOOGLE) {
            // User registered with a different method
            done(
              new ApiError(
                400,
                `Please use your previous login method: ${existingUser.loginType.toLowerCase().replace("_", " ")}.`
              ),
              null
            );
          } else {
            // User exists and used Google SSO
            done(null, existingUser);
          }
        } else {
          // New user, create an account
          const newUser = new User({
            email: profile.emails[0].value,
            password: profile.id, // Using profile ID as password
            isEmailVerified: true,
            avatar: {
              url: (profile._json && profile._json.picture) || "",
              localPath: "",
            },
            loginType: UserLoginType.GOOGLE,
          });

          const savedUser = await newUser.save({validateBeforeSave:false});
          done(null, savedUser);
        }
      } catch (error) {
        done(
          new ApiError(
            500,
            `Error during Google authentication: ${error.message}`
          )
        );
      }
    }
  )
);
