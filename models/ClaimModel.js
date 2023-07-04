const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Claims = new Schema({
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
    WeeklyClaimID: {
        type: String
    }
});
Claims.statics.findByClaimLocation = function (claimLocation) {
    return this.find({ ClaimLocation: claimLocation });
};

module.exports = mongoose.model('claims', Claims);