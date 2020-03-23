let mongoose = require('mongoose');


let userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        info: {
            type: String
        },

        email: {
            type: String,
            required: true,
        },

        auth_level: {
            type: String,
            default: 'user',
        },

        password: {
            type: String,
            required: true,
            min: 6,
            max: 1024
        },
        
        update_at: {
            type: Date,
            default: Date.now()
        },

        created_at: {
            type: Date,
            default: Date.now()
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
)


let User = module.exports = mongoose.model('User', userSchema, 'Users');