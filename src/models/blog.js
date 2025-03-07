import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Blog = sequelize.define('Blog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 200]
        }
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        validate: {
            len: [0, 5000]
        }
    },
    age: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: true,
            min: 0,
            max: 150
        }
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['author'] },
        { fields: ['title'] },
        { fields: ['isDeleted'] }
    ]
});

export default Blog;