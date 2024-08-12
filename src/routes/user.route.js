import { Router } from "express";
import passport from "passport";
import {
  handleSocialLogin,
  userProfile,
} from "../controllers/user.controller.js";
const router = Router();

// SSO routes
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to google...");
  }
);

router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);

router.route("/profile").get(userProfile);
export default router;
