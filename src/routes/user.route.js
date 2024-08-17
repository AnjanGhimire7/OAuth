import { Router } from "express";
import passport from "passport";
import "../passport/index.js"; //import passport config
import { verifyJWT } from "../middlewares/verifyJwt.middleware.js";
import {
  userProfile,
  initialPage,
  failureRedirect,
  handleSocialLogin,
  dashboard,
  logOut,
  refreshAccessToken,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/").get(initialPage);

// SSO routes
router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["email", "profile"] }));

router
  .route("/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/api/v1/error" }),
    handleSocialLogin
  );
router.route("/profile").get(userProfile);
router.route("/logout").get(verifyJWT, logOut);
router.route("/dashboard").get(verifyJWT, dashboard);
router.route("/error").get(failureRedirect);
router.route("/refresh-token").get(verifyJWT, refreshAccessToken);
export default router;
