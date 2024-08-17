import { ApiError } from "../utils/ApiError.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    console.log(accessToken);

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
const initialPage = asyncHandler(async (req, res) => {
  res.send(
    "<a href='http://localhost:5256/api/v1/google' >sign up with google </a>"
  );
});
const handleSocialLogin = asyncHandler(async (req, res) => {
  const user = await User.findOne(req.user);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(301)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .redirect(
      // redirect user to the frontend with access and refresh token in case user is not using cookies
      `${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
});

const userProfile = asyncHandler(async (req, res) => {
  res.send("hello from profile!!!!");
});

const dashboard = asyncHandler(async (req, res) => {
  res.send("dashboard while logging!!!");
});
const failureRedirect = asyncHandler(async (req, res) => {
  res.send("failed while logging!!!");
});
const logOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.validUser._id,
    {
      $unset: {
        refreshToken: "", // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { newAccessToken, newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export {
  handleSocialLogin,
  userProfile,
  initialPage,
  failureRedirect,
  dashboard,
  logOut,
  refreshAccessToken,
};
