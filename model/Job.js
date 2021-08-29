const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    publishedDate: Date,
    title: String,
    link: String,
    neighbourhood: String,
    jobDescription: String,
    compensation: String
});


const Job = mongoose.model("Job",JobSchema);


module.exports = Job;