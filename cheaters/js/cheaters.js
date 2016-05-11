var Cheaters = (function () {
	var publicMenuText, publicActiveItem, currentHeader = 0;

	function switchActive(t,first) {
		if (/^\?/.test(t)) {
			return false;
		} else if (/^\s*$/.test(t)) {
			return true;
		}
		var active = null;

		if (t && !/^\d+$/.test(t)) {
			var re = new RegExp(t.split('').join('.*?'), "img"), test = Cheaters.menuText.match(re);

			if ((test && test.length === 1) || first === true) {
				$('#nav a').each(function(i,e) {
					var linktext = $(e).text().replace(/\s+/g,'').toLowerCase();

					if (re.test(linktext)) {
						if (active === null) { active = i; }
					}
				});
			}
		} else {
			active = parseInt(t,10) - 1;
		}


		if (active !== null) {
			$('#nav li').removeClass('active');
			$($('#nav li').get(active)).addClass('active');
			$link = $($('#nav a').get(active));
			var href = $link.attr('href');
			if (/\.(gif|jpg|svg|png)$/.test(href)) {
				$('#container').empty();
				if ($link.attr('title') !== undefined) {
					$('#container').append($('<h3>').text($link.attr('title')));
				}
				$('#container').append($('<img>').attr('src',href));
				$(document).scrollTop(0);
			} else {
				$('#container').load( href, function() {
					if (/\.md$/.test(href)) {
						var mdText = $('#container').text()
							.replace(/xCMD/g,'⌘')
							.replace(/xOPT/g,'⌥')
							.replace(/xSHIFT/g,'⇧')
							.replace(/xCTRL/g,'^');
						$('#container').html(
							marked(mdText, {
								smartLists: true,
								breaks: true,
								tables: true,
								gfm: true
							})
						);
					}
					$(document).scrollTop(0);
				} );
			}
			// localStorage.setItem('cheatSheet-active',$('#nav li.active').prevAll().length);
			Cheaters.activeItem = active;
			$('#menu select').val(active + 1);
			$.cookie('cheatSheet-active', active, { expires: 365, path: '/' });
			currentHeader = 0;
			return true;
		}

		return false;
	}

	function initClickHandlers() {
		$('#nav').on('click', 'a',function(e){
			e.preventDefault();
			var active = $(this).closest('li').prevAll().length + 1;
			switchActive(active);
			// document.location.hash = $(this).text().toLowerCase();
			return false;
		});
		// $('#menu select').on('change',function(e) {
		// 	e.preventDefault();
		// 	console.log($(this).val());
		// 	switchActive($(this).val());
		// })
		$('#contrast').click(function(e){
			e.preventDefault();
			$body = $('body').first();
			if ($body.hasClass('inverted')) {
				$body.removeClass('inverted');
				// localStorage.setItem('cheatSheet-inverted','false');
				$.cookie('cheatSheet-inverted', 0, { expires: 365, path: '/' });
			} else {
				$body.addClass('inverted');
				// localStorage.setItem('cheatSheet-inverted','true');
				$.cookie('cheatSheet-inverted', 1, { expires: 365, path: '/' });
			}
			return false;
		});
		// $('body').on('click', function(ev) {
		// 	$('#goto').remove();
		// });
	}

	function initKeybindings() {
		Mousetrap.bind('f', function(ev) {
			ev.preventDefault();
			$('#goto').remove();
			$('<input id="goto" type="text">').insertAfter('#nav').val('').blur(function(){
				$(this).fadeOut(100, function(){
					$(this).remove();
				});
			});
			$('#goto').unbind('keyup').keyup(function(ev){
				if (ev.keyCode === 27) {
					ev.preventDefault();
					$('#goto').remove();
					return false;
				} else if (ev.keyCode == 13) {
					if (switchActive($(this).val(),true)) {
						$(this).remove();
					} else if (/^\?/.test($(this).val())) {
						query = $(this).val();
						switch (query.substring(1,3)) {
							case "gh":
							window.location.href = 'https://github.com/search?q=' + encodeURIComponent(query.substring(4));
							break;
							case "so":
							window.location.href = 'http://stackoverflow.com/search?q=' + encodeURIComponent(query.substring(4));
							break;
							case "go":
							window.location.href = 'https://www.google.com/#q=' + encodeURIComponent(query.substring(4));
							break;
							default:
							window.location.href = 'https://duckduckgo.com/?q=' + encodeURIComponent(query.substring(1));
						}
					}
					return false;
				} else {
					if ($(this).val().length > 0) {
						if (switchActive($(this).val())) {
							$(this).remove();
						}
					}
				}
				return true;
			});
			$('#goto').focus().val('');
			return false;
		});

		Mousetrap.bind('esc', function(ev) {
			ev.preventDefault();
			$('#goto').remove();
			return false;
		}, 'keyup');

		Mousetrap.bind('g g', function(ev) {
			$(document).scrollTop(0);
		});

		Mousetrap.bind('G', function(ev) {
			$(document).scrollTop($(document).height());
		});

		Mousetrap.bind('g g', function(ev) {
			$(document).scrollTop(0);
		});

		Mousetrap.bind('G', function(ev) {
			$(document).scrollTop($(document).height());
		});

		Mousetrap.bind(['k','shift+k','u','ctrl+u'], function(ev) {
			var inc = (ev.shiftKey || ev.ctrlKey) ? 400 : 100;
			$('body,html').stop().animate({
				scrollTop: $(document).scrollTop() - inc
			}, 100);
		});

		Mousetrap.bind(['j','shift+j','d','ctrl+d'], function(ev) {
			var inc = (ev.shiftKey || ev.ctrlKey) ? 400 : 100;
			$('body,html').stop().animate({
				scrollTop: $(document).scrollTop() + inc
			}, 100);
		});

		Mousetrap.bind(['.',','], function(ev) {
			var loc = window.pageYOffset,
				headers = $('h1,h2,h3,h4,h5,h6,caption'),
				menuHeight = $('#menu').height(),
				target;

			headers = $.makeArray(headers);

			if (ev.which === 46) {
				target = currentHeader === headers.length - 1 ? headers.length - 1 : currentHeader + 1;
			} else {
				target = currentHeader === 0 ? 0 : currentHeader - 1;
			}
			currentHeader = target;

			$('.active', '#container').removeClass('active');
			$('html,body').stop().animate({
				scrollTop: $(headers[target]).offset().top - menuHeight
			}, 'fast', function() {
				$(headers[target]).addClass('active');
			});

			// $.each(headers, function(i, a) {

			// 	if ((ev.which === 46 && $(a).offset().top - menuHeight > loc) ||
			// 		(ev.which === 44 && $(a).offset().top - menuHeight < loc)) {

			// 		$('html,body').animate({
			// 			scrollTop: $(a).offset().top - menuHeight
			// 		}, 'fast');

			// 		currentHeader = i;
			// 		return false;
			// 	}
			// });
		});

		Mousetrap.bind(['command+shift+]','l'], function() {
			if (Cheaters.activeItem === $('#nav li').length - 1) {
				Cheaters.activeItem = 1;
			} else {
				Cheaters.activeItem += 2;
			}
			switchActive(Cheaters.activeItem);
		});

		Mousetrap.bind(['command+shift+[','h'], function() {
			if (Cheaters.activeItem === 0) {
				Cheaters.activeItem = $('#nav li').length;
			}
			switchActive(Cheaters.activeItem);
		});

		Mousetrap.bind('command+i', function() {
			$('#contrast').click();
		})
	}

	function findStartPage() {
		var active = null,
		hash = document.location.hash;
		if (hash !== "") {
			hash = hash.replace(/^#/,'').replace(/\s+/g,'').toLowerCase();
			if (/^\d+$/.test(hash)) {
				active = hash;
			} else {
				var re = new RegExp("^"+hash.split('').join('.*?'), "i");
				$('#nav a').each(function(i,e) {
					if (re.test($(e).text().replace(/\s+/g,'').toLowerCase())) {
						if (active === null) { active = i; }
					}
				});
			}
		} else {
			// active = localStorage.getItem('cheatSheet-active');
			var lastActive = $.cookie('cheatSheet-active');

			if (lastActive !== undefined) {
				active = parseInt(lastActive,10);
			} else {
				active = 0;
			}
		}

		return active;
	}

	function publicInit() {
		var active = findStartPage() + 1;
		switchActive(active);
		publicActiveItem = active;
		initKeybindings();
		initClickHandlers();
	}

	return {
		menuText: publicMenuText,
		activeItem: publicActiveItem,

		switchTo: switchActive,
		init: publicInit
	};
}());

(function($){
	if ($.cookie('cheatSheet-inverted') === "1") {
		$('body').addClass('inverted');
	}

	$('#nav a').each(function(i,n) {
		Cheaters.menuText += $(n).text() + "\n";
	});

	$("nav#menu").menutron({
		maxScreenWidth: 480,
		menuTitle: 'Cheatsheets:'
	});

	Cheaters.init();

})(jQuery);
