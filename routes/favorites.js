const express = require('express');
const router = express.Router();

const {
    getAllFavorites,
    addFavorite,
    //getFavorite,
    //updateFavorite,
    //deleteFavorite,
} = require('../controllers/favorites')

router.route('/').get( getAllFavorites ).post(addFavorite);
//router.route('/:id').get(getFavorite).patch(updateFavorite).delete(deleteFavorite)

module.exports = router;