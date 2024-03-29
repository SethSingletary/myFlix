const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * this tells the JSON that movie must have a title, description, genre, director, and have an array of actors
 */
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    //Reinsert this code, however need to redo whole data base too
    //Genre: {
      //  Name: String,
        //Description: String
    //},
    Genre: {type: String, required: true},
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});
/**
 * this tells the JSON that a user must have a username, password, email and birthday
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password)

}

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;