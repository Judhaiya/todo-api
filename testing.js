function CustomException(message) {
    const error = new Error(message);
    error.code = 500;
    return error;
}

const checkEligibility = async (age) => {
    try {
        if (age === 20)
            throw new CustomException('20 is not that valid')
    }
    catch (err) {
        console.log(err.code, "err.message")
    }
}
class User {
    name = 'Unknown';

    constructor() {
       
    }
}

const user = new User();
user.name = "yellowing";
checkEligibility(20);
console.log(user);