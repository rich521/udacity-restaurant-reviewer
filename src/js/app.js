'use strict';
var angular,
    io,
    IDBStore;

angular.module('reviewApp', [])
    .controller('MainCtrl', ['$scope', 'orderByFilter', ($scope, orderBy) => {
        //Define all scope variables
        var $s = $scope,
            socket = io.connect('http://localhost:3000/'),
            dataB,
            id = 1;

        // idb access variable
        var cacheReview = {
            id: id,
            listing: []
        };

        // Stored reviews
        $s.reviewed = {
            comment: '',
            name: '',
            rating: ''
        };

        // Display/hide scopes
        $s.gif = false;
        $s.list = false;
        $s.h2 = true;

        // IDB variable
        var idb = new IDBStore({
            dbVersion: 1,
            storeName: 'review',
            keyPath: 'id',
            autoIncrement: true,
            onStoreReady: () => {
                idb.get(id, onsuccess, onerror);
            }
        });

        // Store functions
        function onsuccess(data) {
            if (data) cacheReview = data;
        }

        function onerror(error) {
            console.log('Error: ', error);
        }

        // No empty spaces, null, undefined, and special characters test
        function cstr(str) {
            return (!/[~`!#$%\^&*+=\-\[\]\\;/{}|\\":<>\?]/g.test(str) && str.length && str);
        }
        //Unix time converter
        function unixC(arg) {
            var t = new Date(arg * 1000),
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                year = t.getFullYear(),
                month = months[t.getMonth()],
                date = t.getDate(),
                time = date + '/' + month + '/' + year;
            return time;
        }

        // var searchBtn = document.getElementById('search');
        var s1 = document.getElementById('search_1'),
            s2 = document.getElementById('search_2');


        $s.search = () => {
            var val1 = cstr(s1.value),
                val2 = cstr(s2.value);

            // If both search bar values are acceptable
            if (val1 && val2) {
                $s.subPage.url = 'list.html';
                // Load ajax gif
                $s.gif = true;
                $s.list = false;
                $s.h2 = false;
                //send data values to server
                socket.emit('list', [val1, val2]);
            }
            // After a certain amount of time. Load error page
        };

        var a = ['9am', '10am', '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm'],
            b = ['9pm', '10pm', '11pm', '12pm'];
        // Restaurant list data from your search query
        socket.on('results', (data) => {
            $s.gif = false;
            $s.list = true;

            dataB = data.businesses;
            // Yelp does not provide opening hours. Random made times for project purposes
            for (var i = 0; i < dataB.length; i++) {
                dataB[i].hourOpen = a[Math.floor(Math.random() * a.length)];
                dataB[i].hourClose = b[Math.floor(Math.random() * b.length)];
            }
            // For ajax calls, need to rerender the dom tree
            $s.$apply(() => {
                $s.lists = dataB;
                $s.propertyName = 'age';
                $s.reverse = true;
                $s.friends = orderBy(dataB, $s.propertyName, $s.reverse);
            });
        });
        // On recieving an error from your search query handling
        socket.on('error', () => {
            alert('Could not retrieve data');
        });
        // Declare scope reviews as array
        $s.reviews = [];
        // Restaurant review data from clicking on reviews
        socket.on('result', (data) => {
            // For ajax calls, need to rerender the dom tree
            $s.$apply(() => {
                var res_name = data.name;
                $s.restaurant = res_name;
                // Return if data review is null/invalid
                if (!data.review_count) return;
                // Process data first
                var newData = {
                    // res_name: listingName,
                    name: data.reviews[0].user.name,
                    user_image: data.reviews[0].user.image_url,
                    rating: '' + data.reviews[0].rating,
                    time: unixC(data.reviews[0].time_created),
                    comment: data.snippet_text
                };
                //  Push data to scope when test is false
                $s.reviews.push(newData);
            });
        });

        $s.action = (id, name) => {
            $s.subPage.url = 'listing.html';
            // Refresh review scope
            $s.reviews = [];
            // Retrieve data for specific listing
            socket.emit('listing', id);
            // Load your written reivews
            var ll = cacheReview.listing.length;
            // return if no review exists
            if (!ll) return;
            for (var i = 0; i < ll; i++) {
                var cacheR = cacheReview.listing[i][name];
                if (cacheR) {
                    $s.reviews.push(cacheR);
                }
            }
        };

        $s.sortBy = function(propertyName) {
            $s.reverse = (propertyName !== null && $s.propertyName === propertyName) ? !$s.reverse : false;
            $s.propertyName = propertyName;
            $s.lists = orderBy(dataB, $s.propertyName, $s.reverse);
        };

        $s.addReview = (restaurant) => {
            var d = Date(),
                newDate = d.substring(8, 10) + '/' + d.substring(4, 7) + '/' + d.substring(11, 15);
            // Store local variable from scope
            var cacheListing = {
                [restaurant]: {
                    name: $s.reviewed.name,
                    user_image: "./imgs/profile-picture.svg",
                    rating: $s.reviewed.rating,
                    time: newDate,
                    comment: $s.reviewed.comment
                }
            };
            // push any reviews into existing scope
            cacheReview.listing.push(cacheListing);
            // render the dom with new added reviews
            $s.reviews.push(cacheListing[restaurant]);
            // Clear scope after pushing review
            $s.reviewed = {
                comment: '',
                name: '',
                rating: ''
            };
            // Store your reviews
            idb.put(cacheReview);
        };
    }]);
