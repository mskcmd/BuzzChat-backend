const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: {
      type: String,
      // required: true,
      default:
        "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified()) {
    next();
  }
  const salat = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salat);
  next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
