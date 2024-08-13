import { Router } from "express";
import passport from "passport";
import {
  handleSocialLogin,
  userProfile,
  initialPage,
  failureRedirect,
} from "../controllers/user.controller.js";
const router = Router();

router.route("/").get(initialPage);
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
  .get(
    passport.authenticate("google", { failureRedirect: "/error" }),
    handleSocialLogin
  );

router.route("/profile").get(userProfile);
router.route("/error").get(failureRedirect);
export default router;
