/**
 * Created by mracu on 9/5/14.
 */


var fbSingleton = (function(){
    var fbInstance; //private variable to hold the
    //only instance of Sun that will exits.

    var createFb = function(){
        var appId = "757696504276907";
        var privateAccessToken; //private
        var privateUID;
        var privateFeeds = [];
        var init = function(){
            FB.init({
                appId      : appId,
                version    : 'v1.0'
            });
        };
        var login = function(){
            FB.login(function(response) {
                if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');
                    setData(response);
                    FB.api("/369025106587328/feed",
                        function (response) {
                            setFeeds(response);
                            doWork();
                            if (response && !response.error) {
                                /* handle the result */
                            }
                        });

                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            }, {scope: ['publish_actions']});
        };

        var setData = function(response){
            privateUID = response.authResponse.userID;
            privateAccessToken = response.authResponse.accessToken;
        };

        var setFeeds = function(response){
            privateFeeds  = response.data;
        };

        var checkLogin = function(){
            // create a deferred object
            var r = $.Deferred();

            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    console.log('connected from checkLogin');
                    setData(response);
                    FB.api("/369025106587328/feed",
                        function (response) {
                            setFeeds(response);
                            r.resolve();
                            if (response && !response.error) {
                                /* handle the result */
                            }
                    });
                } else if (response.status === 'not_authorized') {
                    login();
                } else {
                    login();
                }
            });
            return r;
        };

        var constructor = (function(){
            init();
            checkLogin().done(doWork);
        })();
        var getAccessToken = function(){
            //checkLogin();
            return privateAccessToken;
        };
        var getUID = function(){
            checkLogin();
            return privateUID;
        };
        var getFeeds = function(){
            return privateFeeds;
        };
        return {
            uid: getUID,
            access_token: getAccessToken,
            feeds: getFeeds
        };
    };

    return {
        getInstance: function(){
            if(!fbInstance){
                fbInstance = createFb();
            }
            return fbInstance;
        }
    };
})();

var fb = fbSingleton.getInstance();

function doWork(){

    var access_token = fb.access_token();

    showPosts(fb.feeds());

}



function showPosts(posts){
    $('.content').html('');
    for(var i= 0, x = posts.length; i<x; i++){
        posts[i].picture = checkUndefined(posts.picture );
        posts[i].description = checkUndefined(posts[i].description);
        posts[i].name = checkUndefined(posts[i].name );
        posts[i].message = checkUndefined(posts[i].message );
        $('.content').append('<div class="meta-author">'+
            '<img src="https://graph.facebook.com/'+posts[i].from.id+'/picture"><a href="https://facebook.com/'+posts[i].from.id+'" target="_blank">'+
            '<strong >'+posts[i].from.name+'</strong></a>'+
            '<a href="https://www.facebook.com/'+posts[i].from.id+'/" target="_blank"><span class="timeago hasTimeago" title="'+posts[i].created_time+'"></span></a>'+
            '</div>'+
            '<div>'+
            '<h3>'+posts[i].name+'</h3>'+
            '<pre>'+posts[i].message+'</pre>'+
            '<img src="'+posts[i].picture+'" style="max-width:648px;"  />'+
            '<pre>'+posts[i].description+'</pre>'+
            '</div>');
    }
    console.log(posts);
}

function searchFromInput(){
    var value = $('#search').val();
    showPosts(searchTags([value],fb.feeds()));
}

function checkUndefined(dataVar){
    if (typeof dataVar == 'undefined'){
        dataVar = '';
    }
    return dataVar;
}


function searchTags(tags,posts){
    var $return = [];

    if (typeof posts != "undefined"){
        for (var i=0, x=posts.length; i<x; i++ ){
            for (var j=0, l=tags.length; j<l; j++){

                var message = posts[i].message;
                //console.log(typeof message);
                if (typeof message == "string"){
//                console.log(message,tags[j]);
//                console.log(message.search(tags[j]));
                    if (message.search(tags[j])!=-1){
                        $return.push(posts[i]);
                        break;
                    }
                }
            }
        }
    }

    return $return;
}
