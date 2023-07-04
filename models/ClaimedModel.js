const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let claimeditems = new Schema({
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
    }, ClaimedDate: {
        type: String
    }
});
claimeditems.statics.findByClaimLocation = function (claimLocation) {
    return this.find({ ClaimLocation: claimLocation });
};

module.exports = mongoose.model('claimeditems', claimeditems);