import { authCfg, defaultRegion, myBucket, registerRequest, loginRequest, confirmRequest, apiUrl } from './env';
import AWS from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';
import { AuthorizationService } from './services/authorization.service';

import './main.scss';

AWS.config.region = defaultRegion;

const auth = new AuthorizationService(authCfg, AWS.config);

const registerButton = document.querySelector('.registerUser');
const confirmButton = document.querySelector('.confirmUser');
const loginButton = document.querySelector('.loginUser');
const logoutButton = document.querySelector('.logout');
const progressBar = document.querySelector('.progress-bar');
const uplodedFilesListEl = document.querySelector('.uploadedFiles');
const uploadInput = document.querySelector('.uploadInput');
const uploadButton = document.querySelector('.uploadButton');
const listItemsInBucketButton = document.querySelector('.listItems');
const orderAnimationButton = document.querySelector('.orderAnimation');

const greetUser = (userName) => {
    const greetEl = document.querySelector('.greet');
    greetEl.textContent = `Hello ${userName} !`;
};

//EVENT LISTENERS
registerButton.addEventListener('click', () => {
    auth.registerUser(registerRequest)
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
});

confirmButton.addEventListener('click', () => {
    auth.confirmAccount(confirmRequest)
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
});

loginButton.addEventListener('click', () => {
    auth.login(loginRequest)
        .then(res => auth.refreshSession())
        .then(user => greetUser(user.nickname))
        .catch(err => {
            console.log(err);
        });
});

logoutButton.addEventListener('click', () => {
    auth.logout(loginRequest);
});

//refresh session
(() => {
    auth.refreshSession()
        .then(user => {
            greetUser(user.nickname);
        })
        .catch(err => {
            console.log(err);
            greetUser('guest');
        });
})();


const listFilesInBucket = () => {
    const params = {
        Bucket: myBucket,
        MaxKeys: 100
    };

    const s3 = new S3();

    s3.listObjects(params, (err, result) => {
        if (err) {
            console.log(err);
        }

        console.log(result);
    });
};

//list bucket items

listItemsInBucketButton.addEventListener('click', () => {
    listFilesInBucket();
});


const uploadToS3 = (file) => {
    const userId = AWS.config.credentials.identityId;
    console.log(userId);
    const params = {
        Body: file,
        Bucket: myBucket,
        Key: `uek-krakow/${userId}/photos/${file.name}`
    };
    const s3 = new S3();


    return new Promise((resolve, reject) => {
        s3.putObject(params, (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(params.Key);
        }).on('httpUploadProgress', (progress) => {
            const value = Math.round((progress.loaded / progress.total) * 100);
            progressBar.setAttribute('aria-valuenow', value);
            progressBar.setAttribute('style', `width: ${value}%`);
        });
    });
};

const getSignedURL = (key) => {
    const s3 = new S3();
    const params = {
        Bucket: myBucket,
        Key: key
    };
    return s3.getSignedUrl('getObject', params);
};
const createHtmlElFromStr = (str) => {
    let parent = document.createElement('div');
    parent.innerHTML = str.trim();
    return parent.firstChild;
};

const addToUploadetFiles = (url) => {
    const img = `<img src="${url}" alt="img" class="img-thumbnail">`;
    uplodedFilesListEl.children[0].appendChild(createHtmlElFromStr(img));
};

uploadButton.addEventListener('click', () => {
    if (uploadInput.files.length === 0) {
        return;
    }

    const filesToUpload = [...uploadInput.files];
    filesToUpload.forEach((file, i) => {
        uploadToS3(file)
            .then(r => getSignedURL(r))
            .then(url => addToUploadetFiles(url))
            .finally(() => {
                uploadInput.value = "";
                progressBar.setAttribute('aria-valuenow', 0);
                progressBar.setAttribute('style', 'width: 0%');
            })
            .catch(err => {
                console.log(err);
            });
    });
});
// ORDER ANIMATION
const orderAnimation = (photos) => {
    return auth.getAccesToken()
        .then(token => {
            return fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(photos)
            });
        });
};

orderAnimationButton.addEventListener('click', () => {
    orderAnimation()
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        });
});
