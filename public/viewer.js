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
    query: createRequest('GET', 'query')
};

function createRequest(type, method) {
    return {
        type: type,
        url: 'https://livvvid-limited-testing.herokuapp.com/standing/' + method,
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

    $.ajax(requests.query);
});

// r = roundNumber, n = name, o = opponent, s = score, t = twitchHandle, ot = opponentTwitchHandle, os = opponentScore, on = onGoing
function updateBlock(standing) {
    let url = "";
    let json = 0;

    json = JSON.parse(standing);

    twitch.rig.log(json);

    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('platform') == 'mobile')
        url = "https://m.twitch.tv/";
    else
        url = "https://twitch.tv/";


    if (!($('#standing').find('#title').length && $('#standing').find('#roundNumber').length)) {
        let titleBox = '<div class="box"><div class="halfColumn"><div id="title"></div></div><div class="halfColumn"><div id="roundNumber"></div></div></div>';

        $('#standing').append(titleBox);
    }

    if (json.standings !== undefined) {

        for (var i = 0; i < json.standings.length; i++) {

            if (json.standings[i].title !== undefined) {
                if ($('#standing').find('#title').length)
                    $('#standing').find('#title').text(json.standings[i].title);
            }

            if (json.standings[i].r !== undefined) {
                if ($('#standing').find('#roundNumber').length) {
                    $('#standing').find('#roundNumber').text('Round: ' + json.standings[i].r);
                }
            }

            if (json.standings[i].n !== undefined) {

                let name = json.standings[i].n;
                name = '#' + name.replace(/[^A-Za-z]/g, "");

                if (!($('#standing').find(name).length)) {
                    let boxId = '<div id="' + name.replace(/[^A-Za-z]/g, "") + '">';
                    let boxLight = '<div class="box">';
                    let nameBox = '<div class="thirdColumn"><a class="twitchHandle" target="_blank" style="color: #FFFFFF"></a></div><div class="quarterColumn"><div class="score"></div></div>';
                    let opponentBox = '<div class="thirdColumn"><a class="opponentTwitchHandle" target="_blank" style="color: #FFFFFF"></a></div><div class="quarterColumn"><div class="opponentScore"></div></div></div></div>';
                    $('#standing').append(boxId + boxLight + nameBox + opponentBox);

                    $('#standing').find(name).find('a.twitchHandle').text(json.standings[i].n);
                }

                if (json.standings[i].s) {
                    $('#standing').find(name).find('.score').text(json.standings[i].s);
                }

                if (json.standings[i].t !== undefined) {

                    if (json.standings[i].t == "")
                        $('#standing').find(name).find('a.twitchHandle').removeAttr("href");
                    else
                        $('#standing').find(name).find('a.twitchHandle').attr("href", url + json.standings[i].t);
                }

                if (json.standings[i].o !== undefined) {

                    if (json.standings[i].o == "") {
                        $('#standing').find(name).find('.thirdColumn').toggleClass('thirdColumn halfColumn');
                        $('#standing').find(name).find('.quarterColumn').toggleClass('quarterColumn secondHalfColumn');
                        $('#standing').find(name).find('.opponentScore').text("");
                    }
                    else {
                        $('#standing').find(name).find('.halfColumn').toggleClass('halfColumn thirdColumn');
                        $('#standing').find(name).find('.secondHalfColumn').toggleClass('secondHalfColumn quarterColumn');
                    }

                    $('#standing').find(name).find('a.opponentTwitchHandle').text(json.standings[i].o);
                }

                if (json.standings[i].on !== undefined) {
                    if (json.standings[i].on)
                        $('#standing').find(name).find('.box').toggleClass('box boxHighlight');
                    else
                        $('#standing').find(name).find('.boxHighlight').toggleClass('boxHighlight box');

                }

                if (json.standings[i].ot !== undefined) {
                    if (json.standings[i].ot == "")
                        $('#standing').find(name).find('a.opponentTwitchHandle').removeAttr("href");
                    else
                        $('#standing').find(name).find('a.opponentTwitchHandle').attr("href", url + json.standings[i].ot);
                }

                if (json.standings[i].os !== undefined) {
                    $('#standing').find(name).find('.opponentScore').text(json.standings[i].os);
                }

            }

        }
    } 

    $('#standing').children('div').each(function () {
        if ($(this).find('a.twitchHandle').length) {
            if (json.standings.some(e => e.o !== undefined)) {
                if(!(json.standings.some(e => e.n == $(this).find('a.twitchHandle').text())))
                    $(this).remove();
            }
        }
    });


    if (json.standings.some(e => e.on !== undefined)) {
        var sort = $('#standing').children('div').sort(function (a, b) {

            if ($(a).find('#title').length || $(b).find('#title').length)
                return -1;

            if ($(a).find('.boxHighlight').length && $(b).find('.boxHighlight').length)
                return 0;
            if ($(a).find('.boxHighlight').length)
                return -1;
            if ($(b).find('.boxHighlight').length)
                return 1;

            if ($(a).find('.score').length && $(b).find('.score').length) {
                var numA = Number(($(a).find('.score').text())[0]);
                var numB = Number(($(b).find('.score').text())[0]);

                if (numA == numB)
                    return 0;
                if (numA > numB)
                    return -1;
                if (numA < numB)
                    return 1;
            }
        });

        $('#standing').html(sort);
    }

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