let mongoose = require('mongoose');


let serverSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        ip: {
            type: String,
            required: true
        },

        info: {
            type: String
        },
        
        owner_id: {
            type: String,
            required: true
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
 
)


let Servers = module.exports = mongoose.model('Servers', serverSchema, 'Servers');