
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);

const SALT_I = 10;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstname: {
        type: String,
        maxlength: 100
    },
    lastname: {
        type: String,
        maxlength: 100
    },
    token: {
        type: String
    }
});

// Encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function () {
    try {
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(SALT_I);
            this.password = await bcrypt.hash(this.password, salt);
        }
    } catch (error) {
        throw error;
    }
});

// Comparar contraseñas en el Login
userSchema.methods.comparepassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Generar Token JWT al iniciar sesión
userSchema.methods.generateToken = async function () {
    try {
        const token = jwt.sign(
            this._id.toString(),
            config.SECRET
        );

        this.token = token;
        await this.save();

        return this;
    } catch (error) {
        throw error;
    }
};

// Buscar usuario mediante su Token
userSchema.statics.findByToken = async function (token) {
    try {
        const decoded = jwt.verify(token, config.SECRET);

        return await this.findOne({
            _id: decoded,
            token: token
        });
    } catch (error) {
        throw error;
    }
};

// Eliminar token en el Logout
userSchema.methods.deleteToken = async function (token) {
    try {
        await this.updateOne({
            token: token
        }, {
            $unset: { token: 1 }
        });

        this.token = undefined;

        return this;
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
