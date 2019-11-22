
/* To handle first name validation*/

export function validateFirstName(name) {
    var nameRegex = /([A-z][\s\.]|[A-z])+$/;

    name = name.trim();

    if (name == "" || name == undefined || name == null) {
        return { status: false, error: "Please enter your name." };
    }
    else if (name.length < 2) {
        return { status: false, error: "Name must contain more than two chracters." }
    }

    else if (!nameRegex.test(name)) {
        return { status: false, error: 'Name must have characters only.' };
    }
    else {
        return { status: true, error: '' };
    }
}


export function validateTitle(title) {
    var nameRegex = /([A-z][\s\.]|[A-z])+$/;

    title = title.trim();

    if (title == "" || title == undefined || title == null) {
        return { status: false, error: strings("enterTitle") };
    }
    else if (title.length < 2) {
        return { status: false, error: strings("TitleNameContainTwoChar") }
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateInstitute(title) {
    var nameRegex = /([A-z][\s\.]|[A-z])+$/;
    title = title.trim();
    if (title == "" || title == undefined || title == null) {
        return { status: false, error: strings('enterInstitute') };
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateBio(title) {
    var nameRegex = /([A-z][\s\.]|[A-z])+$/;

    title = title.trim();

    if (title == "" || title == undefined || title == null) {
        return { status: false, error: strings('enterBio') };
    }
    else {
        return { status: true, error: '' };
    }
}


/* To handle last name validation*/


export function validateLastName(name) {
    var nameRegex = /^[a-zA-Z ]+$/;

    name = name.trim();

    if (name == "" || name == undefined || name == null) {
        return { status: false, error: strings('lastNameValidation') };
    }
    else if (name.length < 2) {
        return { status: false, error: strings("LastNameContainTwoChar") }
    }

    // else if (!nameRegex.test(name)) {
    // return { status: false, error: 'Please enter characters only.' };
    // }
    else {
        return { status: true, error: '' };
    }
}

export function validateUserName(username) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;

    username = username.trim();

    if (username == "" || username == undefined || username == null) {
        return { status: false, error: strings('firstUsername') };
    }
    else if (!usernameRegex.test(username)) {
        return { status: false, error: strings('validUserName') };
    }
    else {
        return { status: true, error: '' };
    }
}

/* To handle last name validation*/


export function validateUserId(userId) {
    var nameRegex = /^[a-zA-Z ]+$/;

    userId = userId.trim();

    if (userId == "" || userId == undefined || userId == null) {
        return { status: false, error: strings("UserIdValidation") };
    }
    else {
        return { status: true, error: '' };
    }
}

/* To handle email validation */

export function validateEmail(email) {
    //var emailRegex = (/^[A-Z0-9_]+([\.][A-Z0-9_]+)*@[A-Z0-9-]+(\.[a-zA-Z]{2,4})+$/i)
    var emailRegex = /^[A-Z0-9_-]+([\.][A-Z0-9_]+)*@[A-Z0-9-]+(\.[a-zA-Z]{2,5})+$/i;

    email = email.trim();

    if (email == "" || email == undefined || email == null) {
        return { status: false, error: "Please enter Email ID." };
    }
    else if (!emailRegex.test(email)) {
        return { status: false, error: "Please enter valid Email Address." };
    }
    else {
        return { status: true, error: '' };
    }
}


/* To validate password */

export function validatePassword(password) {

    // A password contains at least eight characters, including at least one number and includes both lower and uppercase letters and special characters

    // var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    var passwordRegex = /^ (?=^.{8,16}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    password = password.trim();

    if (password == "" || password == undefined || password == null) {
        return { status: false, error: "Please enter password." }
    }
    else if (password.length < 5) {
        return { status: false, error: "Password must contain 5 or more than 5 characters." };
    }
    else {
        return { status: true, error: '' }
    }
}


/* To validate country */

export function validateLocation(country) {
    country = country.trim();

    if (country == "Location") {
        return { status: false, error: strings("locationValidation") }
    }
    else {
        return { status: true, error: '' }
    }

}

export function validateMonth(month) {
    var monthRegex = /(^0?[1-9]$)|(^1[0-2]$)/;

    month = month.trim();

    if (month == "" || month == undefined || month == null) {
        return { status: false, error: strings("monthValidation") };
    }
    else if (!monthRegex.test(month)) {
        return { status: false, error: strings('validMonth') };
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateYear(year) {
    var yearRegex = /^(19[5-9]\d|20[0-4]\d|2050)$/;

    year = year.trim();

    if (year == "" || year == undefined || year == null) {
        return { status: false, error: strings('enterYear') };
    }
    else if (!yearRegex.test(year)) {
        return { status: false, error: strings('validYear') };
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateCvv(cvv) {
    var cvvregex = /^[0-9]{3,4}$/;

    cvv = cvv.trim();

    if (cvv == "" || cvv == undefined || cvv == null) {
        return { status: false, error: strings("CVVvalidation") };
    }
    else if (!cvvregex.test(cvv)) {
        return { status: false, error: strings('validCVV') };
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateName(name) {
    var nameRegex = /([A-z][\s\.]|[A-z])+$/;

    name = name.trim();

    if (name == "" || name == undefined || name == null) {
        return { status: false, error: strings("Name") };
    }
    else if (!nameRegex.test(name)) {
        return { status: false, error: strings('validName') };
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateWebsiteURL(url) {
    var urlregex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    if (url == null) {
        url = "";
        url = url.trim();
    }
    url = url.trim();


    if (url == "" || url == undefined || url == null) {
        return { status: false, error: 'Please enter website URL.' };
    }
    else if (!urlregex.test(url)) {
        return { status: false, error: 'Please enter valid website URL.' };
    }
    else {
        return { status: true, error: '' };
    }
}
export function validateGoogleURL(url) {
    var urlregex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    if (url == null) {
        url = "";
        url = url.trim();
    }
    url = url.trim();

    if (url == "" || url == undefined || url == null) {
        return { status: false, error: 'Please enter google URL.' };
    }
    else if (!urlregex.test(url)) {
        return { status: false, error: 'Please enter valid google URL.' };
    }
    else {
        return { status: true, error: '' };
    }
}
export function validateTwitterURL(url) {
    var urlregex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    if (url == null) {
        url = "";
        url = url.trim();
    }
    url = url.trim();

    if (url == "" || url == undefined || url == null) {
        return { status: false, error: 'Please enter twitter URL.' };
    }
    else if (!urlregex.test(url)) {
        return { status: false, error: 'Please enter valid twitter URL.' };
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateFacebookURL(url) {
    var urlregex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    if (url == null) {
        url = "";
        url = url.trim();
    }
    url = url.trim();

    if (url == "" || url == undefined || url == null) {
        return { status: false, error: 'Please enter facebook URL.' };
    }
    else if (!urlregex.test(url)) {
        return { status: false, error: 'Please enter valid facebook URL.' };
    }
    else {
        return { status: true, error: '' };
    }
}

export function validateCurrentPassword(password) {

    // A password contains at least eight characters, including at least one number and includes both lower and uppercase letters and special characters

    // var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    var passwordRegex = /^ (?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    password = password.trim();

    if (password == "" || password == undefined || password == null) {
        return { status: false, error: strings('currentPassword') }
    }
    else if (password.length < 6) {
        return { status: false, error: strings('passwordMinChar') };
    }
    else {
        return { status: true, error: '' }
    }
}

export function validateNewPassword(password) {

    // A password contains at least eight characters, including at least one number and includes both lower and uppercase letters and special characters

    // var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    var passwordRegex = /^ (?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    password = password.trim();

    if (password == "" || password == undefined || password == null) {
        return { status: false, error: strings("NewPassword") }
    }
    else if (password.length < 6) {
        return { status: false, error: strings('passwordMinChar') };
    }
    else {
        return { status: true, error: '' }
    }
}


export function validateAge(age) {
    var age_regex = /^\S[0-9]{0,3}$/;
    age = age.trim();

    if (age < 14) {
        return { status: false, error: "User age should be more 14 years." };
    }

    else if (!age_regex.test(age)) {
        return { status: false, error: 'Please enter valid age.' };
    }
    else {
        return { status: true, error: '' }
    }
}