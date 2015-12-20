var imgQ = [];
var bloglist = [];
var tumblrApiUrl = 'https://api.tumblr.com/v2/blog/';
var tumblrApiKey = '0jzY067qvcobXBg8JSRLK6YkOjMOUPqgPIW6siNQBrueMlIIGb';
var blogInput, addBlogButton, fullscreenButton;
var draw_sec = 0;
var load_sec = 0;
var old_img;



function setup(){
    createCanvas(windowWidth, windowHeight);
    background("#36465D");

    addBlogButton = createButton('+');
    $(addBlogButton.elt).css('z-index', 999);
    addBlogButton.position(20, 20);
    addBlogButton.mousePressed(addBlog);

    fullscreenButton = createButton('<>');
    $(fullscreenButton.elt).css('z-index', 999);
    fullscreenButton.position(windowWidth-80, 20);
    fullscreenButton.mousePressed(makeFullscreen);

    blogInput = createInput();
    $(blogInput.elt).css('z-index', 999);
}

function draw(){
    var sec = second();

    if(sec % 4 === 0 && sec !== load_sec && imgQ.length < 3 && bloglist.length > 0){
	load_sec = sec;
	add2Q(null);
    }

    if(sec % 8 === 0 && sec !== draw_sec && imgQ.length > 0){
	draw_sec = sec;
	if(typeof old_img != "undefined"){
	    target = old_img;
	    $(target.elt).fadeOut(300, function(){target.remove();});
	}

	img = imgQ.pop();
	background(img.background);
	i = img.img;
	old_img = i;
	i.position((windowWidth - $(i.elt).width())/2,0);
	$(i.elt).fadeIn(300, function(){i.show()});
    }
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    background("#36465D");
}

function addBlog(){
    blogInput.position(60, 18);
    blogInput.show();
    blogInput.elt.focus();
    blogInput.elt.onkeypress = function(e){
	if(e.which == 13){
	    blogInput.elt.blur();
	    attemptBlog();
	}
    };

    addBlogButton.elt.disabled = true;

}

function attemptBlog(){
    addBlogButton.elt.disabled = false;
    $.ajax({
	url: tumblrApiUrl+blogInput.value()+'.tumblr.com/avatar',
	type: 'GET',
	dataType: 'jsonp',
	data:{
	    jsonp: "blogcheck"
	}
    });
}

function getBlogInfo(blog){
    $.ajax({
	url: tumblrApiUrl+blog+'.tumblr.com/info',
	type: 'GET',
	dataType: 'jsonp',
	data:{
	    api_key: tumblrApiKey,
	    jsonp: "bloginfo"
	}
    });
}

function blogcheck(data){
    if(isValid(data.response)){
	if($.grep(bloglist, function(e){ return e.blog === blogInput.value()}).length < 1){
	    bloglist.push({blog: blogInput.value()});
	}
	blogInput.hide();
	getBlogInfo(blogInput.value());
    } else {
	fill(255, 0, 0);
	blogInput.hide();
	textAlign(LEFT, TOP);
	textFont("Courier");
	text("Not a real tumblog :(", 60, 24);
    }
}

function bloginfo(data){
    if (isValid(data.response)){
	blog = $.grep(bloglist, function(e){ return e.blog === data.response.blog.name })[0];
	blog.posts = data.response.blog.posts;
	blog.url = data.response.blog.url;
	blogInput.value("");
    }
}

function add2Q(data){
    if(data !== null && isValid(data.response) && data.response.posts.length > 0){
	imgs = data.response.posts[0].photos;
	imgs.forEach(function(img){
	    i_obj = {
		height: img.alt_sizes[0].height,
		width: img.alt_sizes[0].width,
		background: "#36465D"
	    };
	    i_obj.img = createImg(img.alt_sizes[0].url, img.alt_sizes[0].url).hide();
	    imgQ.push(i_obj);
	    });
    } else {
	randBlog = floor(random(0, bloglist.length));
	randPost = floor(random(0, bloglist[randBlog].posts));
	$.ajax({
	    url: tumblrApiUrl+bloglist[randBlog].blog+'.tumblr.com/posts',
	    type: 'GET',
	    dataType: 'jsonp',
	    data:{
		api_key: tumblrApiKey,
		limit: 1,
		offset: randPost,
		type: 'photo',
		jsonp: 'add2Q'
	    }
	});

    }
}

function isValid(obj){
    if((Object.prototype.toString.call(obj) === '[object Array]' &&
	typeof obj != "undefined" &&
	obj !== null &&
	obj.length > 0) ||
       ((Object.prototype.toString.call(obj) !== '[object Array]' &&
	obj !== null))
      ){
	return true;
    } else {
	return false;
    }
}

function makeFullscreen(){
    if (document.documentElement.requestFullscreen) {
	document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
	document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
	document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.msRequestFullscreen) {
	document.documentElement.msRequestFullscreen();
    }
}

$(document).on(
    'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',
    function(){
	var isFullScreen = document.mozFullScreen || document.webkitIsFullScreen;
	if(isFullScreen){
	    addBlogButton.hide();
	    fullscreenButton.hide();
	    noCursor();
	} else {
	    addBlogButton.show();
	    fullscreenButton.show();
	    cursor();
	}
    });
