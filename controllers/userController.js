import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { PasswordResetRequest } from "../models/passwordResetScehma.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import { emailContent } from "../utils/otpMessage.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      password,
      role,
      firstNiche,
      secondNiche,
      thirdNiche,
      coverLetter,
    } = req.body;

    if (!name || !email || !phone || !address || !password || !role) {
      return next(new ErrorHandler("All fields are required.", 400));
    }

    if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
      return next(
        new ErrorHandler("Niche fields are required for Job Seeker role.", 400)
      );
    }

    if (
      firstNiche &&
      (firstNiche === secondNiche ||
        firstNiche === thirdNiche ||
        thirdNiche === secondNiche)
    ) {
      return next(new ErrorHandler("Niches must be unique.", 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorHandler("Email already exists.", 400));
    }

    const otp = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const userData = {
      name,
      email,
      phone,
      address,
      password,
      role,
      niches: {
        firstNiche,
        secondNiche,
        thirdNiche,
      },
      coverLetter,
      otp,
      otpExpires,
    };

    if (req.files && req.files.resume) {
      const { resume } = req.files;

      if (resume) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {
              folder: "job_seekers_resume",
            }
          );

          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(new ErrorHandler("Failed to upload resume", 500));
          }

          userData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload resume", 500));
        }
      }
    }

    const user = await User.create(userData);

    const content = emailContent(otp);
    const subject = "Verify Your Email";
    sendEmail({
      email: user.email,
      subject,
      message: content,
    });

    res.status(200).json({
      success: true,
      email: user.email,
      message: "Registration successful. Verification email sent.",
    });
  } catch (error) {
    next(error);
  }
});

export const verifyRegistrationOtp = catchAsyncErrors(
  async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ErrorHandler("Email and OTP are required", 400));
    }

    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.isVerified) {
      return next(new ErrorHandler("User is already verified", 400));
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return next(new ErrorHandler("Invalid or expired OTP", 400));
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    sendToken(user, 200, res, "User Registered and verified succesfully");
  }
);

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler("Please provide email address", 400));
  }
  const user = await User.findOne({ email }).select("+otp +otpExpires");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const tempid = user._id.toString();
  const otpPrefix = tempid.slice(0, 3).toUpperCase();
  const otpSufix = Math.floor(1000 + crypto.randomInt(0, 9000)).toString();
  const otp = `${otpPrefix}${otpSufix}`;
  const otpExpires = Date.now() + 10 * 60 * 1000;

  await PasswordResetRequest.create({
    userId: user._id,
    otp,
    otpExpires,
  });

  const subject = "Verify Your Email";
  const content = emailContent(otp);
  sendEmail({
    email,
    subject,
    message: content,
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent to email",
  });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { otp, newPassword, confirmPassword } = req.body;

  if (!otp || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please Provide complete details", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("New password and confirm password do not match", 400)
    );
  }

  const otpDetails = await PasswordResetRequest.findOne({ otp });

  if (!otpDetails) {
    return next(new ErrorHandler("Please enter correct otp", 400));
  }

  if (otpDetails.otpExpires < Date.now()) {
    return next(new ErrorHandler("OTP has expired", 400));
  }

  const user = await User.findById(otpDetails.userId).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isPassworSame = await user.comparePassword(newPassword);

  if (isPassworSame) {
    return next(new ErrorHandler("Password is already same", 400));
  }

  user.password = newPassword;
  await user.save();

  await PasswordResetRequest.deleteOne({ otp });

  sendToken(user, 200, res, "Password reset successful");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { role, email, password } = req.body;
  if (!role || !email || !password) {
    return next(
      new ErrorHandler("Role, email and password are required.", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid credentials.", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid credentials.", 401));
  }

  if (user.role !== role) {
    return next(new ErrorHandler("Unauthorized access.", 403));
  }

  sendToken(user, 200, res, "User Logged In.");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    coverLetter: req.body.coverLetter,
    niches: {
      firstNiche: req.body.firstNiche,
      secondNiche: req.body.secondNiche,
      thirdNiche: req.body.thirdNiche,
    },
  };
  const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;

  if (
    req.user.role === "Job Seeker" &&
    (!firstNiche || !secondNiche || !thirdNiche)
  ) {
    return next(
      new ErrorHandler("Niche fields are required for Job Seeker role.", 400)
    );
  }

  if (req.files) {
    const resume = req.files.resume;
    if (resume) {
      const currentResumeId = req.user.resume.public_id;
      if (currentResumeId) {
        await cloudinary.uploader.destroy(currentResumeId);
      }
      const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
        folder: "job_seekers_resume",
      });
      newUserData.resume = {
        public_id: newResume.public_id,
        url: newResume.secure_url,
      };
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
    message: "Profile updated successfully.",
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect.", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("New password and confirm password do not match.", 400)
    );
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res, "Password updated successfully.");
});

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  if (user.resume) {
    const resumeID = user.resume.public_id;
    if (resumeID) {
      await cloudinary.uploader.destroy(resumeID);
    }
  }
  if (user.role === "Employer") {
    await Job.deleteMany({ postedBy: user._id });
    await Application.deleteMany({ "employerInfo.id": user._id });
  }
  if (user.role === "Job Seeker") {
    await Application.deleteMany({ "jobSeekerInfo.id": user._id });
  }

  await User.findByIdAndDelete(user._id);

  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    })
    .json({
      success: true,
      message: "User Deleted succesfully with all the applications/jobs",
    });
});
