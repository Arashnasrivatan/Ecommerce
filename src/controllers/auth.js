const response = require("./../utils/response");
const User = require("./../models/User");
const Ban = require("./../models/Ban");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const configs = require("./../configs");
const redis = require("./../redis");
const { sendSms } = require("./../services/sms");

//* Util Functions

function getOtpRedisPattern(phone) {
  return `otp:${phone}`;
}

async function getOtpDetails(phone) {
  const otp = await redis.get(getOtpRedisPattern(phone));
  if (!otp) return { expired: true, remainingTime: 0 };

  let remainingTime = await redis.ttl(getOtpRedisPattern(phone));

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  remainingTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return { expired: false, remainingTime: remainingTime };
}

async function generateOtp(phone, expireTime = 1) {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const hashedOtp = await bcrypt.hash(otp.toString(), 10);
  await redis.set(getOtpRedisPattern(phone), hashedOtp, "EX", expireTime * 60);
  return otp;
}

//* Util Functions End

exports.sent = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const isBan = await Ban.findOne({ phone });

    if (isBan) {
      return response(res, 400, "You are banned");
    }

    const existingUser = await User.findOne({
      phone,
    });

    if (existingUser) {
      return response(res, 400, "a user exist with this info");
    }

    const { expired, remainingTime } = await getOtpDetails(phone);

    if (!expired) {
      return response(
        res,
        200,
        `Otp Already Sent Try Again After ${remainingTime}`,
        { expired, remainingTime }
      );
    }

    const otpCode = await generateOtp(phone);

    //* SMS Service
    const smsResult = await sendSms(phone, [{ name: "Code", value: otpCode }]);

    if (smsResult.status !== 1) {
      return response(res, 400, "Failed To Send Sms");
    }

    return response(res, 200, "Otp Sent Successfully", { otpCode }); //? Send Otp code only for test (SandBox)
  } catch (err) {
    next(err);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { username, phone, password, otp } = req.body;

    const isBan = await Ban.findOne({ phone });

    if (isBan) {
      return response(res, 400, "You are banned");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const savedOtp = await redis.get(getOtpRedisPattern(phone));

    if (!savedOtp) {
      return response(res, 400, "Otp Expired");
    }

    const isOtpCorrect = await bcrypt.compare(otp, savedOtp);

    if (!isOtpCorrect) {
      await redis.del(getOtpRedisPattern(phone));
      return response(res, 400, "Invalid Otp");
    }

    await redis.del(getOtpRedisPattern(phone));

    const user = await User.create({
      phone,
      username,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      {
        expiresIn: configs.auth.accessTokenExpiresInSeconds + "s",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      configs.auth.refreshTokenSecretKey,
      {
        expiresIn: configs.auth.refreshTokenExpiresInSeconds + "s",
      }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await redis.set(
      `refreshToken:${user.id}`,
      hashedRefreshToken,
      "EX",
      configs.auth.refreshTokenExpiresInSeconds
    );

    return response(res, 201, "User Registered Successfully", {
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = req.user;

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      {
        expiresIn: configs.auth.accessTokenExpiresInSeconds + "s",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      configs.auth.refreshTokenSecretKey,
      {
        expiresIn: configs.auth.refreshTokenExpiresInSeconds + "s",
      }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await redis.set(
      `refreshToken:${user.id}`,
      hashedRefreshToken,
      "EX",
      configs.auth.refreshTokenExpiresInSeconds
    );

    return response(res, 200, "User Loged In Successfully", {
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const isUserExist = await User.findOne({ phone });

    if (!isUserExist) {
      return response(res, 404, "No User Found With This Phone Number");
    }

    const isResetTokenExists = await redis.get(`resetTokenReq:${phone}`);

    if (isResetTokenExists) {
      const remainingTime = await redis.ttl(`resetTokenReq:${phone}`);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      const formatedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      return response(res, 400, `try again in ${formatedTime}`);
    }

    const resetToken = uuidv4();

    const storedResetToken = await redis.set(
      `resetToken:${resetToken}`,
      phone,
      "EX",
      120 // 2 minutes
    );

    const resetTokenReq = await redis.set(
      `resetTokenReq:${phone}`,
      resetToken,
      "EX",
      120
    );

    if (!storedResetToken || !resetTokenReq) {
      return response(res, 500, "Error while sending sms"); // For Security
    }

    const resetLink = `${configs.domain}/api/auth/reset-password/${resetToken}`;

    //! send sms
    // const sms = sendSms(phone,[{name:"Token",value:"token"}]) //! cant send sms because of sandbox plan

    return response(
      res,
      200,
      "Reset password link sent to phone number",
      resetLink ?? configs.isProduction != "developing"
    );
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    const phone = await redis.get(`resetToken:${token}`);

    if (!phone) {
      return response(res, 400, "the resetToken does not exist or expired");
    }

    if (newPassword !== confirmPassword) {
      return response(
        res,
        400,
        "newPassword And Confirm Password values must be same"
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOne({
      phone,
    });

    if (!updatedUser) {
      return response(res, 400, "no user found with this phone number");
    }

    updatedUser.password = hashedPassword;

    await updatedUser.save();

    await redis.del(`resetToken:${token}`);
    await redis.del(`resetTokenReq:${phone}`);

    return response(res, 200, "Password changed successfully");
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return response(res, 404, "User not found");
    }
    return response(res, 200, "User data", user);
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const user = req.user;

    const storedRefreshToken = await redis.get(`refreshToken:${user.id}`);

    if (!storedRefreshToken) {
      return response(res, 401, "Please Login Again");
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      {
        expiresIn: configs.auth.accessTokenExpiresInSeconds + "s",
      }
    );

    return response(res, 200, "new accessToken created Successfully", {
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = req.user;
    const deletedRefreshToken = await redis.del(`refreshToken:${user.id}`);

    if (!deletedRefreshToken) {
      return response(res, 400, "Logout failed");
    }
    return response(res, 200, "Logout Successfully");
  } catch (err) {
    next(err);
  }
};
