const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");

router.get("/agent/dashboard", middleware.ensureAgentLoggedIn, async (req,res) => {
	const agentId = req.user._id;
	const numAssignedDonations = await Donation.countDocuments({ agent: agentId, status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ agent: agentId, status: "collected" });
	res.render("agent/dashboard", {
		title: "Dashboard",
		numAssignedDonations, numCollectedDonations
	});
});

router.get('/test', (req, res) => {
    res.send('Test route is working!');
});

// Add this route in your Express.js application
router.get("/agent/donation", async (req, res) => {
    try {
        // Fetch the list of available donations (adjust this based on your data retrieval logic)
        const donations = await Donation.find({status: "accepted" }).populate("donor");
		const user = req.user;
        // Render the food listings page with the donation data
        res.render("agent/listing", { title: "Available Donations", user, donations });
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});
router.get("/agent/donation/view/:donationId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donation = await Donation.findById(donationId);
		res.render("agent/donation", { title: "Donation details", donation });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

const MAX_ASSIGNED_DONATIONS = 2; // Adjust the maximum allowed assigned donations

router.get("/agent/donation/assign/:donationId", middleware.ensureAgentLoggedIn, async (req, res) => {
   try {
       const donationId = req.params.donationId;
       const agentId = req.user._id;


       // Check if the agent already has the maximum allowed assigned donations
       const assignedDonationsCount = await Donation.countDocuments({ status: "assigned", agent: agentId });
       console.log("assignedDonationsCount: " + String(assignedDonationsCount))
       if (assignedDonationsCount >= MAX_ASSIGNED_DONATIONS) {
           req.flash("error", "You have already reached the maximum allowed assigned donations.");
           return res.redirect("back");
       }


       // Update the status of the new donation
       await Donation.findByIdAndUpdate(donationId, { status: "assigned", agent: agentId });


       req.flash("success", "Assigned successfully");
       res.redirect(`/agent/donation/view/${donationId}`);
   } catch (err) {
       console.log(err);
       req.flash("error", "Some error occurred on the server.")
       res.redirect("back");
   }
});

// Instead of handling form submission, assign the donation to the current agent directly
// router.post("/agent/donation/assign/:donationId", middleware.ensureAgentLoggedIn, async (req, res) => {
//     try {
//         const donationId = req.params.donationId;
//         const agentId = req.user._id;

//         // Update the donation with the current agent
//         await Donation.findByIdAndUpdate(donationId, { status: "assigned" , agent: agentId});

//         // Optionally, you can include a message to the agent if needed

//         req.flash("success", "Donation assigned successfully");
//         // res.redirect(`/agent/donation/view/${donationId}`);
//     } catch (err) {
//         console.log(err);
//         req.flash("error", "Some error occurred on the server.");
//         res.redirect("back");
//     }
// });

router.get("/agent/collections/pending", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const pendingCollections = await Donation.find({ agent: req.user._id, status: "assigned" }).populate("donor");
		res.render("agent/pendingCollections", { title: "Pending Collections", pendingCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/agent/collections/previous", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const previousCollections = await Donation.find({ agent: req.user._id, status: "collected" }).populate("donor");
		res.render("agent/previousCollections", { title: "Previous Collections", previousCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/agent/collection/view/:collectionId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		const collection = await Donation.findById(collectionId).populate("donor");
		res.render("agent/collection", { title: "Collection details", collection });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/agent/collection/collect/:collectionId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		await Donation.findByIdAndUpdate(collectionId, { status: "collected", collectionTime: Date.now() });
		
		const donation = await Donation.findById(collectionId);
		const donorId = donation.donor; // Assuming 'donor' is the field storing donor information
		const donor = await User.findById(donorId);
		donor.weight += donation.weight;
		await donor.save();

		req.flash("success", "Donation collected successfully");
		res.redirect(`/agent/collection/view/${collectionId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});



router.get("/agent/profile", middleware.ensureAgentLoggedIn, (req,res) => {
	res.render("agent/profile", { title: "My Profile" });
});

router.put("/agent/profile", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.agent;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id).then(updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/agent/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/agent/collection/cancel/:collectionId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		const update = {
			$set: {
				status: "accepted",
			},
			$unset: {
				adminToAgentMsg: "",
				agent: ""
			}
		};
		await Donation.findByIdAndUpdate(collectionId, update);
		req.flash("success", "Donation cancelled successfully");
		res.redirect(`/agent/collections/pending`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});


module.exports = router;