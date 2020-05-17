import { defaultRegion, myBucket } from './env';
import AWS from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';
import { registerUser } from './user-actions/register-user';
import { confirmAccount } from './user-actions/confirm-user';
import { login } from './user-actions/login-user';
import { refreshSession } from './user-actions/refresh-session';

AWS.config.region = defaultRegion;

const registerButton = document.querySelector('.registerUser');
const confirmButton = document.querySelector('.confirmUser');
const loginButton = document.querySelector('.loginUser');


const greetUser = (userName) => {
    const greetEl = document.querySelector('.greet');
    greetEl.textContent = `Hello ${userName} !`;
};


//EVENT LISTENERS
registerButton.addEventListener('click', () => {
    registerUser()
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
});

confirmButton.addEventListener('click', () => {
    confirmAccount()
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
});

loginButton.addEventListener('click', () => {
    login()
        .then(res => refreshSession())
        .then(user => greetUser(user.nickname))
        .catch(err => {
            console.log(err);
        });
});

//refresh session
(() => {
    refreshSession()
        .then(user => greetUser(user.nickname))
        .catch(err => {
            console.log(err);
            greetUser('guest');
        });
})();


const listFilesInBucket = () => {
    const s3 = new S3();
    const params = {
        Bucket: myBucket,
        MaxKeys: 100
    };

    s3.listObjects(params, (err, result) => {
        if (err) {
            console.log(err);
        }

        console.log(result);
    });
};

//list bucket items
const listItemsInBucketButton = document.querySelector('.listItems');
listItemsInBucketButton.addEventListener('click', () => {
    listFilesInBucket();
});
