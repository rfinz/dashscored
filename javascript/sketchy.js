var imgQ = [];
var bloglist = [];
var tumblrApiUrl = 'https://api.tumblr.com/v2/blog/';
var tumblrApiKey = '0jzY067qvcobXBg8JSRLK6YkOjMOUPqgPIW6siNQBrueMlIIGb';
var draw_sec = 0;
var load_sec = 0;
var looping = true;
var old_img;
var blogInput, addBlogButton, fullscreenButton, gifCheckbox;


function setup(){
    createCanvas(windowWidth, windowHeight);
    background("#36465D");
    labelControls();

    addBlogButton = createButton('+');
    $(addBlogButton.elt).css('z-index', 999);
    addBlogButton.position(20, 20);
    addBlogButton.mousePressed(addBlog);

    fullscreenButton = createButton('<>');
    $(fullscreenButton.elt).css('z-index', 999);
    fullscreenButton.position(windowWidth-60, 20);
    fullscreenButton.mousePressed(makeFullscreen);

    gifCheckbox = createCheckbox();
    $(gifCheckbox.elt).css('z-index', 999);
    gifCheckbox.position(20, windowHeight-40);

    blogInput = createInput();
    $(blogInput.elt).css('z-index', 999);
}

function draw(){
    var sec = second();
    var isFullScreen = document.mozFullScreen || document.webkitIsFullScreen;


    if(sec % 3 === 0 && sec !== load_sec && imgQ.length < 4 && bloglist.length > 0){
	load_sec = sec;
	add2Q(null);
    }

    if(sec % 8 === 0 && sec !== draw_sec && imgQ.length > 0){
	draw_sec = sec;
	transitionImg();
	if(!isFullScreen){
	    listBlogs();
	}
    }
}

function transitionImg(){
    img = imgQ.pop();
    if(img.img.elt.complete){
	if(typeof old_img != "undefined"){
	    target = old_img;
	    $(target.elt).fadeOut(300, function(){target.remove();});
	}

	background("#36465D");

	i = img.img;
	old_img = i;
	i.position((windowWidth - $(i.elt).width())/2, 0);
	$(i.elt).fadeIn(300, function(){
	    i.show();
	});
    } else {
	console.log("IMAGE NOT FULLY LOADED");
	imgQ.push(img);
    }
}

function windowResized(){
    var isFullScreen = document.mozFullScreen || document.webkitIsFullScreen;

    resizeCanvas(windowWidth, windowHeight);
    addBlogButton.position(20, 20);
    fullscreenButton.position(windowWidth-60, 20);
    gifCheckbox.position(20, windowHeight-40);

    if(typeof old_img != "undefined"){
	old_img.position((windowWidth - $(old_img.elt).width())/2, 0);
    }

    background("#36465D");
    if(bloglist.length === 0 && !isFullScreen){
	labelControls();
    } else if(bloglist.length > 0 && !isFullScreen){
	listBlogs();
    }

}

function keyTyped() {
    if (key === ' ') {
	if(looping){
	    noLoop();
	    looping = false;
	} else {
	    loop();
	    looping = true;
	}
    }
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

function removeBlog(e){
    for(var i = 0; i<bloglist.length; i++){
	if(e.target.value === bloglist[i].blog){
	    bloglist[i].button.remove();
	    bloglist.splice(i,1);
	}
    }
    if(bloglist.length === 0){
	imgQ = [];
	background("#36465D");
	labelControls();
    } else {
	background("#36465D");
	listBlogs();
    }
}

function attemptBlog(){
    addBlogButton.elt.disabled = false;
    $.ajax({
	url: tumblrApiUrl+blogInput.value()+'.tumblr.com/info',
	type: 'GET',
	dataType: 'jsonp',
	data:{
	    api_key: tumblrApiKey,
	    jsonp: "blogcheck"
	}
    });
}

function blogcheck(data){
    if(isValid(data.response)){
	if($.grep(bloglist, function(e){ return e.blog === blogInput.value(); }).length < 1){
	    bloglist.push({
		blog: blogInput.value(),
		button: createButton('-').hide().value(blogInput.value()).mousePressed(removeBlog)
	    });
	}
	blogInput.hide();
	blog = $.grep(bloglist, function(e){ return e.blog === data.response.blog.name; })[0];
	blog.posts = data.response.blog.posts;
	blog.url = data.response.blog.url;
	blogInput.value("");
	background("#36465D");
	listBlogs();
    } else {
	fill(255, 0, 0);
	blogInput.hide();
	textAlign(LEFT, TOP);
	textSize(14);
	textFont("Courier");
	text("Not a real tumblog :(", 60, 24);
    }
}

function bloginfo(data){
    if (isValid(data.response)){

    }
}

function add2Q(data){
    if(data !== null && isValid(data.response) && data.response.posts.length > 0){
	imgs = data.response.posts[0].photos;
	imgs.reverse();
	imgs.forEach(function(img){
	    i_obj = {
		height: img.alt_sizes[0].height,
		width: img.alt_sizes[0].width,
		url: img.alt_sizes[0].url,
		background: "#36465D"
	    };
	    if(!gifCheckbox.checked() || img.alt_sizes[0].url.split('.').pop() === 'gif'){
		i_obj.img = createImg(img.alt_sizes[0].url).hide();
		imgQ.push(i_obj);
	    }
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

function labelControls(){
    fill(0, 200, 200);
    textSize(20);
    textAlign(LEFT, TOP);
    textFont("Courier");
    text("Enter the handle of any of your favorite tumblogs e.g. thedailycruft, babycrumbs... enter as many as you want, just one at a time please.", 20, 60, 200, 700);
    text("^ F u l l s c r e e e n", windowWidth-50, 60, 20, 700);
    text("< check box to only display gifs", 60, windowHeight-40, 800, 30);

}

function listBlogs(){
    fill(0, 200, 200);
    textSize(20);
    textAlign(LEFT, TOP);
    textFont("Courier");
    bloglist.forEach(function(e, i, a){
	$(e.button.elt).css({
	    'background': 'transparent',
	    'border': 0,
	    'font-size': '1em',
	    'color': 'rgb(0,200,200)',
	    'cursor': 'pointer'
	});
	e.button.position(20, 60 + 23*i).show();
	text('  ' + e.blog, 20, 60 + 23*i);
    });
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
	    gifCheckbox.hide();
	    bloglist.forEach(function(e){
		e.button.hide();
	    });
	    noCursor();
	} else {
	    addBlogButton.show();
	    fullscreenButton.show();
	    gifCheckbox.show();
	    bloglist.forEach(function(e){
		e.button.show();
	    });
	    cursor();
	}
    });
