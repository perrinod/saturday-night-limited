let token, userId;
const twitch = window.Twitch.ext;

var requests = {
    set: createRequest('POST', 'start'),
    get: createRequest('GET', 'start')
};

function setAuth(token) {
    Object.keys(requests).forEach((req) => {
        twitch.rig.log('Setting auth headers');
        requests[req].headers = { 'Authorization': 'Bearer ' + token }
    });
}

function logError(_, error, status) {
    twitch.rig.log('EBS request returned ' + status + ' (' + error + ')');
    $('#success').text('EBS request returned ' + status + ' (' + error + ')');
}

function logSuccess(standing, status) {
    twitch.rig.log('EBS request returned ' + standing + ' (' + status + ')');
    $('#success').text('EBS request returned ' + ' (' + status + ')');
}


function createRequest(type, method) {
    return {
        type: type,
        url: 'https://livvvid-limited.herokuapp.com/standing/' + method,
        contentType: 'application/json',
        data: JSON.stringify({ link: $('#link').val() }),
        success: logSuccess,
        error: logError,
    }
}

twitch.onContext((context) => {
    twitch.rig.log(context);
});

twitch.onAuthorized((auth) => {
    token = auth.token;
    userId = auth.userId;

    $('#submit').removeAttr('disabled');

    setAuth(token);
});

$(function () {
    $('#submit').click(function () {
        if (!token) { return twitch.rig.log('Not authorized'); }
        twitch.rig.log('Sending link');
        requests.set.data = JSON.stringify({ link: $('#link').val() });
        $.ajax(requests.set);
    });
});