'use strict';

/**
 * @ngdoc function
 * @name tryStreamApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tryStreamApp
 */
angular.module('tryStreamApp')
  .controller('MainCtrl', function ($http, $scope) {
    var vm = this;

    $scope.playVideo = playVideo;

    var video = document.querySelector('video');
    var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

    function initiateMedia(url) {
      var mediaSource = new MediaSource
      video.src = URL.createObjectURL(mediaSource);
      mediaSource.addEventListener('sourceopen', function () {
        var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
        video.addEventListener('ended', function () {
          playNextVideo(url);
        });
        fetchVideo(url, function (buf) {
          sourceBuffer.addEventListener('updateend', function () {
            mediaSource.endOfStream();
            video.play();
          });
          sourceBuffer.appendBuffer(buf);
        });
      });

    }



    function fetchVideo(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        if (this.status == 200) {
          callback(this.response);
        }
      };
      xhr.send();
    }

    // $scope.postVideo = postVideo;
    function postVideo() {
      var Indata = { videoName: 'Music master', videoLength: '56:00', videoSize: 988765 };
      $http.post("http://localhost:8181/api/uploadImage", $scope.formData).then(function (data, status, headers, config) {
        console.log("saved successfully");
        console.log($scope.formData);
      }, function (data, status, headers, config) {
        console.error("error");
      });
    }

    // media/media.json
    // get all videos from the Json
    function getAllVideos() {
      $http.get('http://localhost:8181/api/videoList').then(function (response) {
        $scope.someVideos = response.data;
        initiateMedia($scope.someVideos[0].videoUrl);
      });
    }

    // play a video from the playlist on click
    function playVideo(id) {
      angular.forEach($scope.someVideos, function (video) {
        if (video.id === id) {
          vm.url = video.videoUrl;
          initiateMedia(vm.url);
        }
      })
    }


    // play the next video when current video ends
    function playNextVideo(url) {
      let index = $scope.someVideos.findIndex(vid => vid.videoUrl === url);
      let nextVideoIndex = 0;
      if ((index + 1) >= $scope.someVideos.length) {
        nextVideoIndex = 0
      } else {
        nextVideoIndex = index + 1;
      }

      initiateMedia($scope.someVideos[nextVideoIndex].videoUrl);

    }


    function init() {
      getAllVideos();
    }
    init();
  });
