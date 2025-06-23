import bcrypt from "bcrypt"

const password = 'senha123'; // password you want to test

const hashFromDB = '$2b$10$b41XmQotLKh9e9GQS0Ww7uZtVV7qNX/0kIhDrMY4kM2UEcWl0iSx6'; // copy the hash

bcrypt.hash(password, 10).then(hashedPass => {
    console.log(hashedPass);
});

bcrypt.compare(password, hashFromDB).then(match => {
    console.log('Password matches hash?', match);
});