const express = require("express");
const router = express.Router();

const Donation = require("../models/donation"); // Adjust the path as needed
router.get("/", async (req, res) => {
	try {
	  // Fetch donations with the status "collected" using Mongoose
	  const donations = await Donation.find({ status: "collected" });
  
	  // Calculate the total weight
	  const totalWeight = donations.reduce((sum, donation) => sum + (donation.weight || 0), 0);
	  console.log("totalWeight: " + totalWeight.toString());
  
	  // Render the 'welcome' view with the totalWeight data
	  res.render("home/welcome", { totalWeight });
	} catch (error) {
	  console.error('Error fetching donation data:', error);
  
	  // Render the 'welcome' view without the totalWeight data (it will be undefined)
	  res.render("home/welcome");
	}
  });

router.get("/home/about-us", (req,res) => {
	res.render("home/aboutUs", { title: "About Us | Food Aid" });
});

router.get("/home/mission", (req,res) => {
	res.render("home/mission", { title: "Our mission | Food Aid" });
});

router.get("/home/contact-us", (req,res) => {
	res.render("home/contactUs", { title: "Contact us | Food Aid" });
});


module.exports = router;