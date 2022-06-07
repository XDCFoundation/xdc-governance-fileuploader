/**
 * Created by Sanjeet on 14/02/17.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MediaSchema = new Schema({
    name: {type: String, default: ""},
    sourceFileName: {type: String, default: ""},
    signedUrl: {type: String, default: ""},
    unSignedUrl: {type: String, default: ""},
    path: {type: String, default: ""},
    thumbnail: {type: String, default: "pending"},
    addedOn: {type: Number, default: (new Date).getTime()},
    modifiedOn: {type: String, default: (new Date).getTime()},
    isSignedURL: {type: Boolean, default: false},
    isActive: {type: Number, default: 1},
    isDeleted: {type: Number, default: 0},
    status: {type: String, default: "pending"} /*pending,processing,done for generating url cron*/
});

MediaSchema.method({
    saveObj: function () {
        return this.save();
    }
});

MediaSchema.static({
    getMedia: function (findQuery, limit) {
        if (limit && limit != "")
            return this.find(findQuery).sort("modifiedOn").limit(Number(limit)).exec();
        return this.find(findQuery).sort("modifiedOn").exec();
    },
    saveArray: function (mediaArray) {
        return this.create(mediaArray);
    },
    updateMedia: function (findQuery,updateQuery) {
        return this.update(findQuery,updateQuery,{new:true,multi: true}).exec();
    },
    insertBulkMedia: function(mediaArray){
        return this.insertMany(mediaArray);
    }
});

/**
 * Register
 */

mongoose.model('Media', MediaSchema);
