import { Router } from "express";
import passport from "passport";
import "../passport/index.js";

import {
  userProfile,
  initialPage,
  failureRedirect,
  handleSocialLogin,
} from "../controllers/user.controller.js";
const router = Router();

router.route("/").get(initialPage);
// SSO routes
router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["email", "profile"] }));

router.route("/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/error",
  }),
  handleSocialLogin
);

router.route("/profile").get(userProfile);
router.route("/error").get(failureRedirect);
export default router;
