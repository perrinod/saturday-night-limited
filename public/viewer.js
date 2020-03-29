/**
 *    Copyright 2020 Domenick Perrino
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

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

    var url = "";
    let json = 0;

    try {
        json = JSON.parse(standing);

        var urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get('platform') == 'mobile')
            url = "https://m.twitch.tv/";
        else
            url = "https://twitch.tv/";


        let title = json.title;
        let roundNumber = json.roundNumber;

        let titleBox = '<div class="box"><div class="halfColumn">' + title + '</div><div class="halfColumn"> Round: ' + roundNumber + '</div></div>';

        $('#standing').append(titleBox);

        var opponents = new Set();

        for (let i = 0; i < json.standings.length; i++) {

            let name = json.standings[i].name;
            let twitchHandle = json.standings[i].twitchHandle;
            let totalWins = json.standings[i].totalWins;
            let totalLoss = json.standings[i].totalLoss;
            let onGoing = json.standings[i].onGoing;
            let opponent = json.standings[i].opponent;
            opponents.add(opponent);
            if (!opponent.length == 0) {
                opponents.add(opponent);
            }
            var nameBox = "";
            var boxLight = "";
            var placementBox = "";

            if (onGoing)
                boxLight = '<div class="boxHighlight">';
            else
                boxLight = '<div class="box">';

            var opponentTotalWins = "";
            var opponentTotalLoss = "";
            var opponentTwitchHandle = "";
            var opponentNameBox;

            for (var j = 0; j < json.standings.length; j++) {
                if (json.standings[j].name == opponent) {
                    opponentTotalWins = json.standings[j].totalWins;
                    opponentTotalLoss = json.standings[j].totalLoss;
                    opponentTwitchHandle = json.standings[j].twitchHandle;
                }
            }

            if (!opponents.has(name)) {
                if (!opponent.length == 0) {
                    if (twitchHandle.length == 0)
                        nameBox = '<div class="thirdColumn">' + name + '</div><div class="quarterColumn">' + totalWins + ' - ' + totalLoss + '</div>';
                    else
                        nameBox = '<div class="thirdColumn"> <a href="' + url + twitchHandle + '" target="_blank" style="color: #FFFFFF">' + name + '</a></div><div class="quarterColumn">' + ' ' + totalWins + ' - ' + totalLoss + '</div>';

                    if (opponentTwitchHandle.length == 0)
                        opponentNameBox = '<div class="thirdColumn">' + opponent + '</div><div class="quarterColumn">' + opponentTotalWins + ' - ' + opponentTotalLoss + '</div></div>';
                    else
                        opponentNameBox = '<div class="thirdColumn"> <a href="' + url + opponentTwitchHandle + '" target="_blank" style="color: #FFFFFF">' + opponent + '</a></div><div class="quarterColumn">' + opponentTotalWins + ' - ' + opponentTotalLoss + '</div></div>';

                    $('#standing').append(boxLight + placementBox + nameBox + opponentNameBox);

                }
                else {
                    if (twitchHandle.length == 0)
                        nameBox = '<div class="halfColumn">' + name + '</div><div class="halfColumn">' + totalWins + ' - ' + totalLoss + '</div>';
                    else
                        nameBox = '<div class="halfColumn"> <a href="' + url + twitchHandle + '" target="_blank" style="color: #FFFFFF">' + name + '</a></div><div class="halfColumn">' + ' ' + totalWins + ' - ' + totalLoss + '</div>';

                    $('#standing').append(boxLight + placementBox + nameBox);
                }
            }
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

    setInterval(function () {
        $('.halfColumn').each(function () {
            var pos = $(this).scrollLeft();
            $(this).scrollLeft(pos + 2);

            if ($(this).scrollLeft() + $(this).width() >= $(this).prop('scrollWidth'))
                $(this).scrollLeft(0);
        });
    }, 200);

    setInterval(function () {
        $('.thirdColumn').each(function () {
            var pos = $(this).scrollLeft();
            $(this).scrollLeft(pos + 2);

            if ($(this).scrollLeft() + $(this).width() >= $(this).prop('scrollWidth'))
                $(this).scrollLeft(0);
        });
    }, 200);
});