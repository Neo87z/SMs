const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let WeeklyWinners = new Schema({
    FirstName: {
        type: String
    },
    LastName: {
        type: String
    },
    Email: {
        type: String
    },
    Phone: {
        type: String
    },
    ClaimLocation: {
        type: String
    },
    ClaimDate: {
        type: String
    },
    ClaimableItem: {
        type: String
    },
    UniquieID: {
        type: String
    }
});


module.exports = mongoose.model('weeklywinners', WeeklyWinners);