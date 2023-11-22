const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
	donor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true
	},
	agent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
	},
	foodType: {
		type: String,
		required: true
	},
	quantity: {
		type: String,
		required: true
	},
	expiryDate: {
		type: Date,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	city: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		required: true
	},
	donationType: {
		type: String,
		enum: ["compost", "food"],
		required: true
	},
	donorToAdminMsg: String,
	adminToAgentMsg: String,
	collectionTime: {
		type: Date,
	},
	status: {
		type: String,
		enum: ["pending", "rejected", "accepted", "assigned", "collected"],
		required: true
	},
});

const Donation = mongoose.model("donations", donationSchema);
module.exports = Donation;