var token = "";
var tuid = "";
var ebs = "";

var twitch = window.Twitch.ext;

// create the request options for Twitch API calls
var requests = {
    set: createRequest('POST', 'cycle'),
    get: createRequest('GET', 'query')
};

function createRequest(type, method) {
    return {
        type: type,
        url: 'https://livvvid-limited.herokuapp.com/standing/' + method,
        success: logSuccess,
        error: logError
    }
}

function setAuth(token) {
    Object.keys(requests).forEach((req) => {
        twitch.rig.log('Setting auth headers');
        requests[req].headers = { 'Authorization': 'Bearer ' + token }
    });
}

twitch.onContext(function (context) {
    twitch.rig.log(context);
});

twitch.onAuthorized(function (auth) {
    token = auth.token;
    tuid = auth.userId;

    setAuth(token);
    $.ajax(requests.get);
});

function updateBlock(standing) {
    $('#standing').empty();

    let json = 0;

    try {
        json = JSON.parse(standing);

        let title = json.title;
        let roundNumber = json.roundNumber;

        let titleBox = '<div id="box"><div id ="halfColumn">' + title + '</div><div id ="halfColumn"> Round: ' + roundNumber + '</div></div>';

        $('#standing').append(titleBox);

        for (let i = 0; i < json.standings.length; i++) {

            let placement = json.standings[i].placement;
            let name = json.standings[i].name;
            let twitchHandle = json.standings[i].twitchHandle;
            let totalWins = json.standings[i].totalWins;
            let totalLoss = json.standings[i].totalLoss;
            var nameBox = "";

            let placementBox = '<div id="box"><div id ="column">' + placement + '</div>';
            if(twitchHandle.length == 0)
                nameBox = '<div id="column">' + name + '</div><div id="column">' + totalWins + ' - ' + totalLoss + '</div></div>';
            else
                nameBox = '<div id="column"> <a href="' + twitchHandle + '" target="_blank" style="color: #FFFFFF">' + name + '</a></div>' + '<div id="column">' + totalWins + ' - ' + totalLoss + '</div></div>';

            $('#standing').append(placementBox + nameBox);
        }
    }
    catch (e) { twitch.rig.log('Error parsing JSON ' + '( ' + e + ' )'); }
}

function logError(_, error, status) {
    twitch.rig.log('EBS request returned ' + status + ' (' + error + ')');
}

function logSuccess(standing, status) {
    twitch.rig.log('EBS request returned ' + standing + ' (' + status + ')');
    updateBlock(standing);
}

$(function () {
    // listen for incoming broadcast message from our EBS
    twitch.listen('broadcast', function (target, contentType, standing) {
        twitch.rig.log('Received broadcast standing');
        updateBlock(standing);
    });
});