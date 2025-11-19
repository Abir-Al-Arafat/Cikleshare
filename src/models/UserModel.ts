import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    username: {
      type: String,
      //   default: function () {
      //     return `user_${Date.now()}`;
      //   },
      //   unique: true,
    },
    email: {
      type: String,
      required: [true, "please provide email"],
      unique: true,
    },
    password: {
      type: String,
      required: [
        function (this: any) {
          return !this.googleId; // Check for googleId
        },
        "Please provide a password",
      ],

      minlength: 5,
      select: false,
    },
    image: {
      type: String,
    },
    googleId: {
      type: String,
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0],
      },
    },
    address: {
      type: String,
    },

    paymentIntent: {
      type: String,
    },

    subscriptions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    ],

    roles: {
      type: [String],
      enum: ["user", "organizer", "driver", "admin", "superadmin"],
      default: ["user"],
    },

    phone: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dateOfBirth: {
      type: Date,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyCode: {
      type: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ currentLocation: "2dsphere" });

export default mongoose.model("User", userSchema);
