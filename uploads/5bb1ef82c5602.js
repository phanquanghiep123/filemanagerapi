var geolocation = {
	lat: 21.028511,
	lng: 105.804817
};
var window_W = $("html").width();
var window_H = $("html").height();
if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		geolocation = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};
	});
}
function loadding ($element){
	$element.append('<div class="loadding_ajax"><div class="load_ajax"></div></div>')
}
function removeloadding($element){
	$element.find(".loadding_ajax").remove();
}
var App = angular.module('ThemeApp', ["ngMap"]);
App.config(['$qProvider', function($qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
}]);
App.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
	$httpProvider.interceptors.push(['$q', function($q) {
		return {
			request: function(config) {
				if (config.data && typeof config.data === 'object') {
					config.data = $.param(config.data);
				}
				return config || $q.when(config);
			}
		};
	}]);
}]);
App.controller("PageController", function($scope, $http,$compile) {
	$("#content").hide();
	$scope.defaultContent = 1900;   
	$scope.callserver   = 0;
	$scope.review      = 0;
	$scope.oldsection   = {id : 0};
	$scope.review       = 0;
	$scope.snow         = null;
	$scope.scaleWidth   = 0;
	$scope.upload       = $("#box-upload #upload");
	$scope.uploads      = $("#box-upload #uploads");
	$scope.theme        = {};
	$scope.oldFunction  = null;
	$scope.theme.id = ThemeID;
	$scope.theme.ramkey = Ramkey;
	$scope.theme.effect = 0;
	$scope.theme.effect_file = {
		minsize : 10,
		maxsize : 40,
		onnew   : '800'
	};
	$scope.image_effects;
	$scope.theme.effect_media_id = 0;
	$scope.theme.effect_play  = 0;
	$scope.theme.sound_play   = 0;
	$scope.mode_class = "adjustment view-page";
	$scope.content_actions = "";
	$scope.sections = null;
	$scope.blocks = null;
	$scope.parts = null;
	$scope.metas = null;
	$scope.Pmetas = [];
	$scope.SVblocks = [];
	$scope.SVsections = [];
	$scope.SVparts = [];
	$scope.section = null;
	$scope.block = null;
	$scope.part = null;
	$scope.meta = null;
	$scope.mode = 0;
	$scope.tabbackground = 0;
	$scope.action_name = "";
	$scope.action_body = "";
	$scope.action_bottom = "";
	$scope.group_backgrounds = [];
	$scope.group_sounds = [];
	$scope.sounds = [];
	$scope.tabsound = 0;
	$scope.backgrounds = [];
	$scope.fonts = [];
	$scope.taggetTab = 0;
	$scope.item = {};
	$scope.years = [];
	var min = 1990;
	var today = new Date() ;
	$scope._month_ = today.getMonth() + 1;
	$scope._day_   = today.getDate() ;
	$scope._year_  = today.getFullYear();
	$scope._hours_ = today.getHours();
	$scope._defaultday_ = $scope._day_ + '/' + $scope._month_ + "/" + $scope._year_;
	var max = (new Date()).getFullYear();
	$scope.years = [];
	for (var i = min; i <= max; i++) {
		$scope.years.push(i);
	}
	var tag_audio = new Audio();
	var currentAction = false;
	$scope.support_key = "theme";
	var zindex = 9999;
	var current_key = 0;
	$scope.background_repeat = ["repeat", "repeat-x", "repeat-y", "no-repeat", "initial", "inherit"];
	$scope.background_size = ["auto", "cover", "contain", "initial", "inherit"];
	$scope.backgroundType = [ {
		name: "Sử dụng ảnh mẫu",
		"id": "1"
	}];
	$scope.background_position = ["left top", "left center", "left bottom", "right top", "right center", "right bottom", "center top", "center center",
		"center bottom"
	];
	$scope.background_attachment = ["scroll", "fixed", "local", "initial", "inherit"];
	$scope.$watch('theme.font', function() {
		if ($scope.theme.font != null && typeof $scope.theme.font.name != "undefined") {
			$scope.theme.style["font-family"] = $scope.theme.font.name;
			$scope.theme.font_file = $scope.theme.font.id;
		}	
	}, true);
	$scope.$watch('theme.sound', function() {
		if ($scope.theme.sound == null) tag_audio.pause();
		if ($scope.theme.sound != null) $scope.theme.sound_file = $scope.theme.sound.id;
		else $scope.theme.sound_file = 0;
	}, true);
	//sidebar.
	$scope.actionschange = [
		{
			id: 0,
			value: "adjustment view-page",
			name: "Tuy chỉnh",
			active: 1
		},
		{
			id: 1,
			value: "view-page",
			name: "Xem trang",
			active: 0
		},
		{
			id: 2,
			value: "colonnade",
			name: "Bố cục",
			active: 0
		}
	]
	$scope.menus = [
		{
			name: "Chế chỉnh sửa",
			id: "page-change",
			controller: "SidebarChange",
			icon : "fa fa-windows"
		},
		{
			name: "Nền trang",
			id: "page-background",
			controller: "SidebarBackground",
			icon : "fa fa-picture-o"
		},
		{
			name: "Phông chữ",
			id: "page-font",
			controller: "SidebarFont",
			icon : "fa fa-fonticons"
		},
		{
			name: "Nhạc nền",
			id: "page-sound",
			controller: "SidebarSound",
			icon : "fa fa-music"
		},
		{
			name: "Hiệu ứng",
			id: "page-effect",
			controller: "SidebarEffect",
			icon : 'fa fa-snowflake-o'
		},
		{
			name: "Sắp xếp",
			id: "sort-section",
			controller: "SortSection",
			icon : "fa fa-refresh"
		},
		{
			name: "Chọn style file",
			id: "page-style",
			controller: "SidebarParts",
			icon : 'fa fa-folder-open'
		},
		{
			name: "Thông tin giao diện",
			id: "page-info",
			controller: "SidebarParts",
			icon : "fa fa-info-circle"
		}
	];
	$scope.font_size = "";
	for (var i = 10 ; i< 100 ; i++){
		$scope.font_size += i+"px ";
	}
	//get pramater_server 
	$scope.$watch('theme.font', function() {
		if ($scope.callserver == 1 && $scope.theme.font != null && typeof $scope.theme.font.name != "undefined") {
			$scope.theme.style["font-family"] = $scope.theme.font.name;
			$scope.theme.font_file = $scope.theme.font.id;
		}	
		return false;
	}, true);
	$scope.$watch('theme.sound', function() {
		if ($scope.callserver == 1 && $scope.theme.sound == null) tag_audio.pause();
		if ($scope.callserver == 1 && $scope.theme.sound != null) $scope.theme.sound_file = $scope.theme.sound.id;
		else $scope.theme.sound_file = 0;
		return false;
	}, true);
	$scope.$watch('section', function(newValue, oldValue) {
		if($scope.section == null) return false;
		if($scope.section != null){
			setTimeout(function (){
				$scope.oldsection = $scope.section ;
			},1000);
		}
	}, true);
	$scope.$watch('section.blocks', function(newValue, oldValue) {
		if($scope.section == null) return false;
		if(newValue != null && oldValue != null){
			if((newValue.length != oldValue.length) || $scope.section.order == true){
				$scope.section.order == false;
				var blocks_on  = [];
				var blocks_off = [];
				$scope.section.more = parseInt($scope.section.ncolum_show_block);
				for (var i = 0; i < $scope.section.blocks.length; i++) {
					$scope.section.blocks[i].$index = i;
					if($scope.section.blocks[i].id == $scope.section.default_block){
						blocks_off.push($scope.section.blocks[i]);
					}else{
						blocks_on.push($scope.section.blocks[i]);
					}
				} 
				try{
					$scope.section.blocks_on  = blocks_on;
					$scope.section.blocks_off = blocks_off;
					if($scope.oldsection.id == $scope.section.id){
						$scope.section.defaultblock();
					}
				}catch (e) {
					console.log(e);
				}	
			}
		}
	}, true);
	$scope.$watch('section.ncolum_block', function(newValue, oldValue) {
		if($scope.section == null && $scope.oldsection != null) return false;
		if( $scope.oldsection.id == $scope.section.id){
			try{
				$scope.section.defaultblock();
			}catch(e){
				
			}
		}
		return false;
	}, true);
	$scope.$watch('section.ncolum_show_block', function(newValue, oldValue) {
		if($scope.section == null) return false;
		if($scope.oldsection.id == $scope.section.id){
			try{
				$scope.section.more = $scope.section.ncolum_show_block;
				$scope.section.defaultblock();
			}catch(e){
				
			}
		}
		return false;
	}, true);
	$scope.$watch('section.more', function(newValue, oldValue) {
		if($scope.section != null && $scope.oldsection.id == $scope.section.id){
			try{
				$scope.section.defaultblock();
			}catch(e){
				return false;
			}
		}
		return false;
	}, true);
	$scope.loaddPage = function(){
		$("body").append('<div class="loadding_ajax"><div class="load_ajax"></div></div>');
	}
	$scope.GotoSection = function(section){
		$('section.active').removeClass("active");
		$('section[ramkey=' + $scope.section.ramkey + ']').addClass("active");
		try {
			$('html').animate({
				scrollTop: $('section[ramkey=' + $scope.section.ramkey + ']').offset().top - 22
			}, 1000);	
		} catch (r) {}
	}	
	$scope.CreateBlockGroup = function(){
		try{
			this.section.blocks_on  = [];
			this.section.blocks_off = [];
			this.section.onload     = 0;
			this.section.more = parseInt(this.section.ncolum_show_block);
			for (var i = 0; i < this.section.blocks.length; i++) {
				this.section.blocks[i].$index = i;
				this.section.blocks[i].active = 0;
				if(this.section.blocks[i].id == this.section.default_block){
					this.section.blocks_off.push(this.section.blocks[i]);
				}else{
					this.section.blocks_on.push(this.section.blocks[i]);
				}
			}
		}catch(e){
			return false;
		}
		return true;
	}
	$scope.Changeffect = function(){
		if($scope.theme.effect != 1) $scope.theme.effect = 1;
		else $scope.theme.effect = 0;
	}
	$scope.changeShowHiddenSection = function(){ 
		if($scope.section.show_title != 1) $scope.section.show_title = 1;
		else $scope.section.show_title = 0;
	}
	$scope.changeWidthSection = function(){ 
		if($scope.section.is_full != 1) $scope.section.is_full = 1;
		else $scope.section.is_full = 0;
	}
	$scope.ChangeRunSound = function(){
		if($scope.theme.sound_play != 1) $scope.theme.sound_play = 1;
		else $scope.theme.sound_play = 0;
	}
	$scope.ChangeActive = function(){
		if($scope.theme.is_active != 1) $scope.theme.is_active = 1;
		else $scope.theme.is_active = 0;
	}
	$scope.removeloaddPage = function(){
		$("body > .loadding_ajax").remove();
	}
	$scope.ToggleSidaber = function($event){
		$("#sidebar").toggleClass("open");
		if($scope.support_key == "section") $scope.save_section();
		return false;
	}
	$scope.initPage = function(){
		$scope.loaddPage(); 
		if($scope.callserver == 0){
    	//get section
			$http({
				method: "POST",
				responseType: "json",
				data: { id : $scope.theme.id },
				url: AppAccessCotroller + "themes/get_section/" + $scope.theme.id
			}).then(function(response) {
				$scope.sections   = response.data.sections;
				$scope.SVsections = response.data.sectionsv;
				$scope.theme      = Object.assign($scope.theme, response.data.theme);
				if($scope.theme.effect_file == null){
					$scope.theme.effect_file = {};
				}
				$("#content").show();
				$scope.removeloaddPage();
				$scope.callserver = 1;
			}, function(error) {
				location.reload();
			});
			//!get section;
			$http({
				method         : "POST",
				responseType   : "json",
				url: AppAccessCotroller + "themes/get_pramater_server"
			}).then(function(response) {
				$scope.SVsections = response.data.sections;
				$scope.SVblocks   = response.data.blocks;
				$scope.SVparts    = response.data.parts;
			}, function(error) {
			});
			//!get pramater_server 
			//get sounds 
			$http({
				method         : "POST",
				responseType   : "json",
				url: AppAccessCotroller + "themes/get_groups_backgrounds_sounds"
			}).then(function(response) {
				$scope.group_backgrounds = response.data.backgrounds;
				$scope.group_sounds      = response.data.sounds;
				$scope.image_effects     = response.data.effects;
			}, function(error) {
				location.reload();
			});
			//!get sounds
		}
		$.datetimepicker.setLocale('vi');
	}
	$scope.initPage();	
	$scope.CallActions = function(){
		if(this.action.key_id == "add"){
			$scope.BlockAdd(this.$parent.block,this.$parent.$parent.section);
		}else if(this.action.key_id == "edit"){
			$scope.BlockEdit(this.$parent.block,this.$parent.$parent.section)
		}else if(this.action.key_id == "delete"){
			$scope.BlockDelete(this.$parent.$parent.$index)
		}
	}
	$scope.DeleteMeta = function(index){
		this.$parent.$parent.part.metas.splice(index,1);
	}
	$scope.CreateBlockGroup = function(){
		this.section.blocks_on  = [];
		this.section.blocks_off = [];
		this.section.onload     = 0;
		this.section.more = parseInt(this.section.ncolum_show_block);
		for (var i = 0; i < this.section.blocks.length; i++) {
			this.section.blocks[i].$index = i;
			this.section.blocks[i].active = 0;
			if(this.section.blocks[i].id == this.section.default_block){
				this.section.blocks_off.push(this.section.blocks[i]);
			}else{
				this.section.blocks_on.push(this.section.blocks[i]);
			}
		}
		return true;
	}
	$scope.InitBlockAction = function ($type){
		$.each (this.block.actions,function(){
			if(this.key_id == $type && (this.active == 1 || this.active == "1")){
				return true;
			}
		});
		return false;
	}
	$scope.checkaction = function() {
		if ($scope.actionChangeCurrent = this.action.value) {
			this.action.check = true;
		}
	}
	$scope.ClosechangeSectionStyle =function(){
		$("#sidebar-chang-style-section").removeClass("open");
		try{
			$scope.oldFunction();
		}catch(e){}
		return false;
	}
	$scope.hoverInBlock = function(){
		this.block.active = 1;
	}
	$scope.hoverOutBlock = function(){
		this.block.active = 0;
	}
	$scope.getContentmenu = function(item  = null) {
		var _this = item != null ? item : this.menu;
		$scope.support_key = "theme";
		$scope.action_name = _this.name;
		if(_this.id == "sort-section"){
			$scope.taggetTab = 1;
			return false;
		}
		if(typeof _this.template != "undefined"){
			$scope.action_body = _this.template ;
			_this.load = 0;
			$("#sidebar-actions").css("z-index", zindex);
			zindex++;
			$("#sidebar-actions").addClass("open");
			$scope.oldFunction = function (){
				$scope.getContentmenu(_this);
			};
			return false;
		}
		_this.load = 1;
		$http({
			method: "POST",
			responseType : "text",
			data: {
				template: _this.id,
				theme_id: $scope.theme.id
			},
			url: AppAccessCotroller + "themes/get_template_by_sidebar"
		}).then(function(response) {
			$(".content-actions").removeClass("open");
			 _this.template = $scope.action_body = response.data;
			_this.load = 0;
			$("#sidebar-actions").css("z-index", zindex);
			zindex++;
			$("#sidebar-actions").addClass("open");
			$scope.oldFunction = function (){
				$scope.getContentmenu(_this);
			};
		}, function(error) {	
			_this.load = 0;
			window.location.href =  AppAccessCotroller + "/themes/edit/"+$scope.theme.id;
		});
		return false;
	}
	$scope.getBackgrounds = function(group) {
		$(".content-actions").removeClass("open");
		$scope.chosse_name = group.name;
		$scope.backgrounds = group.backgrounds;
		group.load = 1;
		$scope.chosse_body = "<ul class=\"nav-list-items list_image\"><li ng-init=\"initBackground(background)\" ng-class=\"(background.active == 1) ? 'active' :''\" ng-repeat=\"background in backgrounds\" ng-click=\"ChosseBackground(background)\" class=\"item\" id=\"{{background.id}}\"><img src=\"#\" ng-src=\"{{background.thumb}}\"/></li></ul>";
		$("#sidebar-chosse").css("z-index", zindex);
		zindex++;
		$("#sidebar-chosse").addClass("open");
		group.load = 0;
		return false;
	}
	$scope.initBackground = function(background){
		if($scope.theme.background != null){
			if($scope.theme.background.id == background.id){
				background.active = 1;
			}
		}
	}
	$scope.getSounds = function(group) {
		$scope.single_name = group.name;
		$scope.sounds = group.sounds;
		group.load = 1;
		$scope.single_body = "<ul class=\"nav-list-items list_category sound_lists\">\
			<li ng-init=\"InitSound(sound)\" ng-repeat=\"sound in sounds\" class=\"item\" id=\"{{sound.id}}\">\
				{{sound.name}} <div class=\"action\" src=\"#\" ng-src=\"{{sound.path}}\">\
					<span ng-class=\"(sound.start == 1) ?'fa-play-circle':'fa-pause-circle'\" class=\"fa\" ng-click=\"StartStop(sound,$event)\" id=\"start_stop\"></span>\
					<span ng-class=\"(sound.active == 1) ? 'fa-check-circle-o' :'fa-circle-thin'\" ng-click=\"ChosseSounds(sound)\"  class=\"fa\"></span>\
				</div>\
			</li>\
		</ul>";
		$(".content-actions").removeClass("open");
		$("#sidebar-single").css("z-index", zindex);
		zindex++;
		$("#sidebar-single").addClass("open");
		group.load = 0;
		return false;
	}
	$scope.InitSound = function(sound){
		if($scope.theme.sound != null){
			if($scope.theme.sound.id == sound.id){
				sound.active = 1;
			}
		}
	}
	$scope.AddNewBlock = function(){
		$scope.loaddPage(); 
		$http({
			method: "POST",
			responseType : "json",
			data: {
				theme_section_id : $scope.section.theme_section_id,
				section_id       : $scope.section.id,
				sort             : $scope.section.blocks.length,
				block_id         : $scope.section.default_block
			},
			url: AppAccessCotroller + "themes/addblockdefault"
		}).then(function(response) {
			$scope.block  = response.data;
			$scope.section.blocks.push($scope.block);
			$scope.BlockEdit($scope.block,$scope.section);
			try{
				$scope.section.reload();
			}catch(e){}
			$scope.removeloaddPage(); 
		}, function(error) {
			$scope.removeloaddPage(); 
			window.location.href =  AppAccessCotroller + "/themes/edit/"+$scope.theme.id;
		});
	}
	$scope.AddItem = function($type = null) {
		if($type != null) $scope.support_key = $type;
		if ($scope.support_key == "theme") {
			$scope.single_name = "Thêm section";
			$scope.single_body =
				"<ul class=\"nav-list-items list_category add-items svsections\"><li ng-class=\" (svsection.load == 1) ?'loadding' : ''\" ng-repeat=\"svsection in SVsections\" ng-click=\"SectionAddNow(svsection)\" class=\"item\" id=\"{{svsection.id}}\">{{svsection.name}}</li></ul>";
		} else if ($scope.support_key == "section") {
			$scope.single_name = "Thêm block";
			$scope.single_body =
				"<ul class=\"nav-list-items list_category add-items svblocks\"><li ng-class=\" (svblock.load == 1) ?'loadding' : ''\" ng-repeat=\"svblock in SVblocks\" ng-click=\"BlockAddNow(svblock)\" class=\"item\" id=\"{{svblock.id}}\">{{svblock.name}}</li></ul>";
		} else if ($scope.support_key == "block") {
			$scope.single_name = "Thêm block";
			$scope.single_body =
				"<ul class=\"nav-list-items list_category add-items svparts\"><li ng-class=\" (svpart.load == 1) ?'loadding' : ''\" ng-repeat=\"svpart in SVparts\" ng-click=\"PartAddNow(svpart)\" class=\"item\" id=\"{{svpart.id}}\">{{svpart.name}}</li></ul>";
		}
		$(".content-actions").removeClass("open");
		$("#sidebar-single").css("z-index", zindex);
		zindex++;
		$("#sidebar-single").addClass("open");
		$scope.support_key == "theme";
		$scope.oldFunction = null;
	}
	$scope.PartAddNow = function(svpart) {
		svpart.load = 1;
		$http({
			method: "POST",
			responseType : "json",
			data: {
				part             : svpart,
				block_id         : $scope.block.id,
				sort             : $scope.block.parts.length,
				section_block_id : $scope.block.section_block_id,
				theme_section_id : $scope.section.theme_section_id
			},
			url: AppAccessCotroller + "themes/addpart"
		}).then(function(response) {
			$scope.part = (response.data); 
			$scope.parts.push(response.data);
			svpart.load = 0;
		}, function(error) {
			svpart.load = 0;
		});
	}
	$scope.IsList = function(part){
		if(part.name.trim() == "list images") return true;
		return false;
	}
	$scope.SectionAddNow = function(svsection) {
		svsection.load = 1;
		$http({
			method: "POST",
			responseType : "json",
			data: {
				svsection   : svsection,
				ramkey      : $scope.theme.ramkey,
				sort        : $scope.sections.length,
				theme_id    : $scope.theme.id
			},
			url: AppAccessCotroller + "themes/addsection"
		}).then(function(response) {
			$scope.section = (response.data);
			$scope.sections.push(response.data);
			svsection.load = 0;
			setTimeout(function(){
				if ($scope.section != null && $scope.support_key == "section") {
					$('section.active').removeClass("active");
					$('section[ramkey=' + $scope.section.ramkey + ']').addClass("active");
					try {
						$('html').animate({
							scrollTop: $('section[ramkey=' + $scope.section.ramkey + ']').offset().top - 22
						}, 400);	
					} catch (r) {}
				}
			},300);
		}, function(error) {
			svsection.load = 0;
			window.location.href =  AppAccessCotroller + "/themes/edit/"+$scope.theme.id;
		});
	}
	$scope.BlockAddNow = function(svblock) {
		svblock.load = 1;
		$scope.support_key == "block";
		$http({
			method: "POST",
			responseType : "json",
			data: {
				svblock 	     : svblock,
				section_id       : $scope.section.id,
				sort             : $scope.section.blocks.length,
				theme_section_id : $scope.section.theme_section_id
			},
			url: AppAccessCotroller + "themes/addblock"
		}).then(function(response) {	
			$scope.block = (response.data);
			$scope.section.blocks.push(response.data);
			$scope.blocks = $scope.section.blocks;
			svblock.load = 0;
			try{
				$scope.section.reload();
			}catch(e){}
			$scope.BlockEdit($scope.block, $scope.section);
			setTimeout(function(){
				try {
					$('html').animate({
						scrollTop: $('block[ramkey=' + $scope.block.ramkey + ']').offset().top 
					}, 400);
					$scope.block.active = 1	
				} catch (r) {}
			},300);
			$scope.ToBlock();
		}, function(error) {
			svblock.load = 0;
			window.location.href =  AppAccessCotroller + "/themes/edit/"+$scope.theme.id;
		});
	}
	$scope.ChangeSackgroundSection = function() {
		$(".content-actions").removeClass("open");
		$("#sidebar-chang-style-section").css("z-index", zindex);
		zindex++;
		$("#sidebar-chang-style-section").addClass("open");
		$scope.is_changeSectionStyle = true;
	}
	$scope.RemoveSound = function() {
		$.each($scope.sounds, function() {
			this.active = 0;
		});
		$scope.theme.sound = false;
	}
	$scope.Review = function(){
		$scope.review = 1;
		$scope.loaddPage();
		$scope.Public($("save-box-right"),1);
	}
	$scope.StartStop = function(sound, $event) {
		$event.stopPropagation();
		$.each($scope.sounds, function() {
			if (sound.id != this.id) {
				this.start = 0;
			}
		});
		if (sound.start == 1) {
			tag_audio.pause();
			sound.start = 0;
		} else {
			tag_audio.src = sound.path;
			tag_audio.play();
			sound.start = 1;
		}
		return false;
	}
	$scope.ChosseSounds = function(sound) {
		$.each($scope.sounds, function() {
			if (sound.id != this.id) {
				this.active = 0;
			}
		});
		sound.active = !sound.active;
		if (sound.active == 1) {
			$scope.theme.sound      = sound;
			$scope.theme.sound_file = sound.media_id;
		} else {
			$scope.theme.sound = null;
			$scope.theme.sound_file = 0;
		}
		return false;
	}
	$scope.getActionType = function(type) {
		$scope.single_name = type.name;
		type.load = 1;
		if (type.id == 0) {
			$scope.single_body = "<ul class=\"nav-list-items list_category\"><li openfilemanager href=\"javascript:;\" class=\"ui-button-text\" data-action=\"background-image\" data-type=\"image\" data-max=\"1\" id=\"openFilemanager\"> Mở thư viện file</li><li uploads data-max=\"1\" data-type=\"image\" data-action=\"background-image\">Tải ảnh lên</li> </ul>";
		} else {
			$scope.single_body ="<ul class=\"nav-list-items list_category\"><li ng-class=\"(group.load == 1) ? loadding:''\" ng-repeat=\"group in group_backgrounds\" ng-click=\"getBackgrounds(group)\" class=\"item\" id=\"{{group.id}}\">{{group.name}}</li></ul>";
		}
		$(".content-actions").removeClass("open");
		$("#sidebar-single").css("z-index", zindex);
		zindex++;
		$("#sidebar-single").addClass("open");
		type.load = 0;
		return false;
	}
	$scope.OpenExampleEffect = function() {
		$scope.single_name = "Ảnh mẫu hiệu ứng";
		$scope.single_body = "<ul class=\"nav-list-items list_image ng-scope\"><li ng-init=\"initImageEffect(image_effect)\" ng-class=\"(image_effect.active == 1) ? 'active' :''\" ng-repeat=\"image_effect in image_effects\" ng-click=\"ChosseImageEffect(image_effect)\" class=\"item\" id=\"11\"><img src=\"#\" ng-src=\"{{image_effect.thumb}}\"></li></ul>";
		$(".content-actions").removeClass("open");
		$("#sidebar-single").css("z-index", zindex);
		zindex++;
		$("#sidebar-single").addClass("open");
		return false;
	}
	$scope.ChosseImageEffect = function(image_effect) {
		$.each($scope.image_effects, function() {
			this.active = 0;
		});
		$scope.theme.effect = 1;
		$scope.theme.effect_file.path  = image_effect.path;
		$scope.theme.effect_file.thumb = image_effect.thumb;
		$scope.theme.effect_media_id   = image_effect.id;
		image_effect.active = 1;
	}
	$scope.ChangeEffectFile = function(){
		$scope.support_key = "theme";
		$scope.single_name = "Chọn ảnh hiệu ứng";
		$scope.single_body = "<ul class=\"nav-list-items list_category\"><li openfilemanager href=\"javascript:;\" class=\"ui-button-text\" data-action=\"effect\" data-type=\"image\" data-max=\"1\" id=\"openFilemanager\"> Mở thư viện file</li><li uploads data-max=\"1\" data-type=\"image\" data-action=\"effect\">Tải ảnh lên</li> </ul>";
		$(".content-actions").removeClass("open");
		$("#sidebar-single").css("z-index", zindex);
		zindex++;
		$("#sidebar-single").addClass("open");
		return false;
	}
	$scope.ChosseBackground = function(background) {
		if ($scope.support_key == "theme") {
			$scope.theme.style["background-image"] = "url('" + background.thumb + "')";
		} else if ($scope.support_key == "section") {
			$scope.section.style["background-image"] = "url('" + background.thumb + "')";
		}
		$.each($scope.backgrounds, function() {
			this.active = 0;
		});
		background.active = 1;
		return false;
	}
	$scope.RemoveBg = function($v) {
		if ($v == 0) {
			if ($scope.support_key == "theme") {
				$scope.theme.style["background-image"] = "inherit";
			} else if ($scope.support_key == "section") {
				$scope.section.style["background-image"] = "inherit";
			}
		} else if ($v == 1) {
			if ($scope.support_key == "theme") {
				$scope.theme.style["background-color"] = "inherit";
			} else if ($scope.support_key == "section") {
				$scope.section.style["background-color"] = "inherit";
			}
		}
	}
	$scope.changmode = function(action) {
		$.each($scope.actionschange, function() {
			this.active = 0;
		});
		$scope.mode = action.id;
		$.each($scope.sections,function(){
			try{
				this.reload();
			}catch(e){}
		});
		action.active = 1;
		$scope.mode_class = action.value;
		return false;
	}
	$scope.Ftabbackgroundimage = function($v) {
		$scope.tabbackgroundimage = $v;
		return false;
	}
	$scope.CloseActions = function() {
		$("#sidebar-actions").removeClass("open");
		return false;
	}
	$scope.CloseSingle = function() {
		$("#sidebar-single").removeClass("open");
		try {
			$scope.oldFunction();
		}catch(e){}
		return false
	}
	$scope.CloseChosse = function() {
		$("#sidebar-chosse").removeClass("open");
		try {
			$scope.oldFunction();
		}catch(e){
			
		}
		return false;
	}
	$scope.ToSection = function(section) {
		$scope.taggetTab = 0;
		$("#sidebar-section").css("z-index", zindex);
		zindex++;
		$("#sidebar-section").addClass("open");
		$scope.support_key = "section";
		$scope.section     = section;
		$scope.blocks      = section.blocks;
		if ($scope.section != null && $scope.support_key == "section") {
			$('section.active').removeClass("active");
			$('section[ramkey=' + $scope.section.ramkey + ']').addClass("active");
			try {
				$('html').animate({
					scrollTop: $('section[ramkey=' + $scope.section.ramkey + ']').offset().top - 22
				}, 400);	
			} catch (r) {}
		}
		return false;
	}
	$scope.MoveBlockDefault = function(section) {
		$scope.support_key = "section";
		$scope.section     = this.section;
		$scope.blocks      = this.section.blocks;
		$(".content-actions").removeClass("open");
		$("#sidebar-order-block").css("z-index", zindex);
		zindex++;
		$("#sidebar-order-block").addClass("open");
		return false;
	}
	$scope.CloseOrderBlock =function(){
		$scope.support_key = "theme";
		$("#sidebar-order-block").removeClass("open");
		return false;
	}
	$scope.ToBlock = function(block) {
		$scope.support_key = "block";
		this.block.active = 1;
		$scope.block = this.block;
		setTimeout(function(){
			try {
			$('html').animate({
				scrollTop: $('block[ramkey=' + $scope.block.ramkey + ']').offset().top - 22
			}, 400);	
		} catch (r) {}
		},300)
		
		$scope.BlockEdit(this.block, this.$parent.section);
		return false;
	}
	$scope.MetaShow = function() {
		//meta show
		var part = this.part;
		var html_show = part.html_show;
		var list_show = part.list_show;
		html_show     = html_show.replace("{{value}}",list_show);
		var stringR = '';
		if(part.metas.length > 0){
			if (part.metas[0].media_id != 0 && part.metas[0].meta_key =="value_media") {
				stringR = html_show.replace("{{value}}",'{{part.metas[0].thumb}}').replace("{{media_id}}", "{{part.metas[0].media_id}}");
			} else {
				if(part.name == "content"){
					var text = part.metas[0].value;
					jtext = $(text);
					var stringText = "";
					var content = $("<div></div>");
					$.each(jtext.find("span"),function(key,val){
						key ++;
						var stringspan = $(this).text();
						stringText += stringspan;
						if(stringText.length >= 280){
							stringspan = stringspan.substring(0, 280);
							$(this).html(stringspan);
							content.append($(this).parent());
							return false;
						}else{
							content.append($(this).parent());
						}

					});
					jtext.html(content.html());
					stringR = jtext.wrap("<div></div>").parent().html();
					stringR = html_show.replace("{{value}}",stringR);
				}else{
					stringR = html_show.replace("{{value}}",part.metas[0].value);
				}
				
			}
		}
		return stringR;
	}
	$scope.Show_Title = function(val) {
		if (val == 1 || $scope.mode == 0) return true;
		else return false;
	}
	$scope.blockShow = function(section,block){
		if($scope.mode == 2) return true;
		if(block.id == section.default_block){
			return false;
		} 
		else return true;
	}
	$scope.SectionEdit = function(section) {
		$(".content-actions").removeClass("open");
		$scope.save_section();
		$scope.support_key = "section";
		$scope.section = section;
		$scope.blocks = section.blocks;
		$scope.taggetTab = 0;
		$("#sidebar-section").css("z-index", zindex);
		zindex++;
		$("#sidebar-section").addClass("open");
		setTimeout(function(){
			$("#sidebar").addClass("open");
		},500);
		$scope.oldFunction = function(){
			$scope.SectionEdit(section);
		}
		return false;
	}
	$scope.SectionDelete = function($index) {
		current_key  = $index;
		$scope.section = this.section;
		$scope.support_key = 'section';
		$("#modal-delete-item").modal();
		return false;
	}
	$scope.Deletetheme = function($index) {
		$scope.support_key = 'theme';
		$("#modal-delete-item").modal();
		return false;
	}
	$scope.SectionAdd = function(section) {
		$scope.support_key = "section";
		section.order = true;
		$scope.section = this.$parent.section;
		$scope.blocks  = $scope.section.blocks;
		$scope.AddItem();
		return false;
	}
	$scope.BlockEdit = function(block, section) {
		$scope.support_key = "block";
		$scope.block = block;
		$scope.parts = block.parts;
		$scope.section = section;
		$("#modal-edit-block").modal();
		return false;
	}
	$scope.BlockDelete = function(block,section) {
		$scope.block    = block;
		section.order   = true;
		$scope.section  = section;
		$scope.support_key = 'block';
		$("#modal-delete-item").modal();
		return false;
	}
	$scope.BlockAdd = function(block, section) {
		$scope.support_key = "block";
		$scope.block = block;
		$scope.parts = block.parts;
		$scope.section = section;
		$scope.AddItem();
		return false;
	}
	$scope.FormEdit = function(meta) {
		var html_edit = this.$parent.part.html_edit;
		var form_edit = html_edit.replace("{{value}}", "");
		if (meta["meta_key"] == "value_text") {
			var s = $('<div>' + form_edit + '</div>');
			s.find('[name="value_text"]').attr("ng-model", "meta.value");
			s.find('[name="value_text"]').attr("id",meta.ramkey);
		} else {
			return form_edit;
		}
		return s.html();
	}
	$scope.FormEditNull = function() {
		var html_edit = this.$parent.part.html_edit;
		return html_edit;
	}
	$scope.ValueForm = function(meta) {
		var list_show = this.$parent.part.list_show;
		var html_show = this.$parent.part.html_show;
		list_show     = html_show.replace("{{value}}",list_show)
		$scope.part   = this.$parent.part
		$scope.metas   = $scope.part.metas;
		var form_edit = "";
		if (meta["meta_key"] != "value_text") {
			if (meta["meta_key"] == "value_media") {
				form_edit = list_show.replace("{{value}}", "{{meta.thumb}}").replace("{{media_id}}", "{{meta.media_id}}");
				form_edit =  $("<div>"+form_edit+"</div>");
				form_edit.find(".delete-item").attr("ng-click","DeleteMeta($index)");
				form_edit = form_edit.html();
			} else if (meta["meta_key"] == "map_point") {
				form_edit = list_show.replace("{{value}}", "");
				form_edit = $('<div>' + form_edit + '</div>');
				form_edit.find('[name^="map_point"]').attr("ng-model", "meta.value");
				form_edit = form_edit.html();
			}
		}
		return form_edit;
	}
	$scope.PartEdit = function(part) {
		$scope.part  = part;
		$scope.metas = $scope.part.metas;
		$scope.support_key = "part";
		$("#modal-edit-part").modal();
		return false;
	}
	$scope.DeleteItem = function (){
		var data = null;
		var $e = $("#modal-delete-item .btn-warning");
		loadding($e);
		if($scope.support_key == "section"){
			try{
				data  = {
					theme_section_id : $scope.section.theme_section_id
				};
				$scope.sections.splice(current_key, 1);
			}catch(e){
				console.log(e);
				return false;
			}
		}else if($scope.support_key == "block"){
			try{
				data  = {
					theme_section_id : $scope.block.theme_section_id,
					section_block_id : $scope.block.section_block_id
				};
				$scope.section.blocks.splice($scope.block.$index,1);
				$scope.section.reload();
			}catch(e){
			}
		}else if($scope.support_key == "part"){
			try{
				data  = {
					block_part_id    : $scope.part.block_part_id,
					theme_section_id : $scope.part.theme_section_id,
					section_block_id : $scope.part.section_block_id
				};
				$scope.parts.splice(current_key, 1);
			}catch(e){
			}
		}else if($scope.support_key == "theme"){
			$http({
				method : "POST",
				responseType : "json",
				data : {id : $scope.theme.id},
				url  : AppAccessCotroller + "appthemes/deletetheme/",
			}).then(function(response) {
				removeloadding($e);
				$("#modal-delete-item").modal("hide");
				if(response.data.status == "success"){
					window.location.href = response.redirect;
				}else{
					window.location.href = "/appthemes/edit/"+$scope.theme.slug;
				}
			}, function(error) {
				removeloadding($e);
				window.location.href = "/appthemes/edit/"+$scope.theme.slug;
			});
			return false;
		}
		if(data != null){
			$http({
				method : "POST",
				responseType : "json",
				data : {item : data},
				url  : AppAccessCotroller + "themes/deleteitem/" + $scope.support_key,
			}).then(function(response) {
				removeloadding($e);
				$("#modal-delete-item").modal("hide");
			}, function(error) {
				removeloadding($e);
				window.location.href =  AppAccessCotroller + "/themes/edit/"+$scope.theme.id;
			});
		}
	}
	$scope.PartDelete = function($index, parts) {
		current_key  = $index;
		$scope.support_key = 'part';
		$scope.parts = parts;
		$scope.part  = this.part;
		$("#modal-delete-item").modal();
		return false;
	}
	$scope.Public = function ($e = null,openreview = 0){
		if($e == null){
			$e = $(".save-box-left");
		}
		loadding($e);
		try{
			if($scope.support_key == "section")
				$scope.save_section();
		}catch(e){}
    	var dataTheme = {
			id 				: $scope.theme.id,
			name 			: $scope.theme.name,
			description 	: $scope.theme.description,
			thumb 			: $scope.theme.thumb,
			font_file  	 	: $scope.theme.font_file,
			folder      	: $scope.theme.folder,
			sound_file  	: $scope.theme.sound_file,
			size_title  	: $scope.theme.size_title,
			color_title 	: $scope.theme.color_title,
			color_title 	: $scope.theme.color_title,
			effect      	: $scope.theme.effect,
			effect_file 	: $scope.theme.effect_file,
			effect_media_id : $scope.theme.effect_media_id,
			public      	: $scope.theme.public,
			status      	: $scope.theme.status,
			style       	: $scope.theme.style,
			sound_play      : $scope.theme.sound_play,
			is_active       : $scope.theme.is_active
		}
		$http({
			method : "POST",
			responseType : "json",
			data : dataTheme,
			url  : AppAccessCotroller + "themes/save_theme/",
		}).then(function(response) {
			setTimeout(function(){
				if(openreview == 1) $("#modal-review").modal();
			},300);
			removeloadding($e);
		}, function(error) {
			removeloadding($e);
			window.location.href =  AppAccessCotroller + "themes/edit/"+$scope.theme.id;
		});
	}
	$scope.save_block = function(){
		if($scope.support_key == "block"){
			$scope.support_key == "section";
			//$scope.loaddPage();
			var parts = [];
			var metas = [];
			$.each($scope.block.parts,function(key,val){
				metas = [];
				$.each(this.metas,function(){
					metas.push({
						id               : this.id,
						value            : this.value,
						media_id         : this.media_id,
						section_block_id : this.section_block_id,
            meta_key         : this.meta_key,
						theme_section_id : this.theme_section_id,
						block_part_id    : this.block_part_id,
						ramkey           : this.ramkey
					});
					try{ this.reload(); }catch(e){}
				});
				parts.push({
					actions          : this.actions,
					class_name       : this.class_name,
					ncolum           : this.ncolum,
					block_part_id    : this.block_part_id,
					section_block_id : this.section_block_id,
					theme_section_id : this.theme_section_id,
					metas            : metas,
					sort             : key
				});
			});
			$http({
				method: "POST",
				responseType: "json",
				data : {
					actions          : $scope.block.actions,
					class_name       : $scope.block.class_name,
					ncolum           : $scope.block.ncolum,
					section_block_id : $scope.block.section_block_id,
					theme_section_id : $scope.block.theme_section_id,
					parts            : parts
				},
				url  : AppAccessCotroller + "themes/save_block/",
			}).then(function(response) {
				$scope.removeloaddPage();
				$scope.support_key == "section";
			}, function(error) {
				$scope.removeloaddPage();
				window.location.href =  AppAccessCotroller + "themes/edit/"+$scope.theme.id;
			});
		}
	}
	$scope.save_section = function(){
		if($scope.support_key == "section"){
			$scope.loaddPage();
			$http({
				method: "POST",
				responseType: "json",
				data: {
					theme_section_id : $scope.section.theme_section_id,
					actions          : $scope.section.actions,
					class_name       : $scope.section.class_name,
					name 			 : $scope.section.name,
					sort             : $scope.section.sort,
					show_title       : $scope.section.show_title,
					default_block    : $scope.section.default_block,
					ncolum_show_block: $scope.section.ncolum_show_block,
					ncolum_block     : $scope.section.ncolum_block,
					is_full          : $scope.section.is_full,
					layout_show_block: $scope.section.layout_show_block,
					style            : $scope.section.style
				},
				url  : AppAccessCotroller + "themes/save_section/",
			}).then(function(response) {
				$scope.removeloaddPage();
				$scope.support_key == "theme";
			}, function(error) {
				window.location.href =  AppAccessCotroller + "themes/edit/"+$scope.theme.id;
			});	
		}
	}
	$scope.RemoveEffectFile = function(){
		$scope.theme.effect_file.thumb = null;
	}
	$scope.CloseSection = function() {
		$scope.support_key == "section";
		$scope.save_section();
		$scope.section = null;
		$("#sidebar-section").removeClass("open");
		$scope.support_key = "theme";
		$scope.taggetTab = 0;
		$scope.oldsection = {id : 0};
		return false;
	}
	$scope.UpdateSort = function ($type = "section",$list = []){
		$scope.loaddPage();
		$http({
			method: "POST",
			responseType: "json",
			data : {list : $list},
			url  : AppAccessCotroller + "themes/updatesort/" + $type,
		}).then(function(response) {
			$scope.removeloaddPage();
		}, function(error) {
			window.location.href =  AppAccessCotroller + "themes/edit/"+$scope.theme.id;
		});
	}
	$scope.MoreSection = function(section) {
		section.more += parseInt(section.ncolum_show_block);
		try{ 
			section.defaultblock(); 
		}catch(e){
		
		}
		return true;
	}
	$scope.ActionSection = function(section){
		var section_action = "";
		var  Actionadd = Actiondelete = Actionedit =  ActionMove =  ActionMore = "";
		$.each(section.actions,function(){
			if(this.key_id == "edit"){
				section_action+='<li><a ng-click="SectionEdit(section)" href="javascript:;" id="edit-action"><i class="fa fa-pencil" aria-hidden="true"></i></a></li>';			}
			
            if(this.key_id == "delete"){
				section_action+= '<li><a ng-click="SectionDelete($index)" href="javascript:;" id="delete-action"><i class="fa fa-trash" aria-hidden="true"></i></a></li>';
			}
			
		});
		if(section.default_block != 0){
			section_action+= '<li><a ng-click="SectionAdd(section)" href="javascript:;" id="add-action"><i class="fa fa-plus-square" aria-hidden="true"></i></a></li>';
			section_action+= '<li><a ng-click="MoveBlockDefault(section)" href="javascript:;"><i class="fa fa-arrows" aria-hidden="true"></i></a></li>';
		}     
		return section_action;
	};
	$scope.ClosechangeSectionStyle =function(){
		$("#sidebar-chang-style-section").removeClass("open");
		try{
			$scope.oldFunction();
		}catch(e){}
		return false;
	}
	$scope.ActionBlock = function(section){
		var block = this.block;
		var block_action = "<li><a ng-click=\"BlockEdit(block,section)\" href=\"javascript:;\" id=\"edit-block\"><i class=\"fa fa-pencil\" aria-hidden=\"true\"></i></a></li>\
		<li><a ng-click=\"BlockAdd(block,section)\" href=\"javascript:;\" id=\"add-part\"><i class=\"fa fa-plus-square\" aria-hidden=\"true\"></i></a></li>\
		<li><a ng-click=\"BlockDelete(block,section)\" href=\"javascript:;\" id=\"delete-block\"><i class=\"fa fa-trash\" aria-hidden=\"true\"></i></a></li>\
		<li><a id=\"move-action\"><i class=\"fa fa-arrows\" aria-hidden=\"true\"></i></a></li>";
		return block_action;
	}
	$scope.Upload = function(_this){
		var formData = new FormData();  
		$.each(_this.files,function(k,v){
			formData.append('files[]', v, v.name);
		}) ;
		var type_action = $(_this).attr("data-action");
		$scope.loaddPage();      
		$.ajax({
		    url  	 : AppAccess  + "filemanager/uploadflash/",
		    data 	 : formData,
		    type     : 'POST',
		    dataType : "json",
		    contentType  : false, 
		    processData  : false,  
		    success : function(e){
		    	if(e.status == "success"){
		    		$.each(e.response, function(k, v) {
		    			if($scope.support_key == "block"){
		    				v.media_id 			= v.id;
							v.id 				= $scope.part.metas[0];
							v.block_part_id    	= $scope.part.block_part_id;
							v.meta_key         	= "value_media";
							v.section_block_id 	= $scope.part.section_block_id;
							v.theme_section_id 	= $scope.part.theme_section_id;
							$scope.part.metas[0] = (v);
		    			}else if($scope.support_key == "theme"){
							if (type_action == "background-image") {
								$scope.theme.style['background-image'] = 'url(' + v.path + ')';
							}else if(type_action == "sound"){
								var newsound       = v;
								newsound.active    = 1;
								newsound.start     = 0;
								$scope.theme.sound = newsound;
								$scope.theme.sound_file = newsound.media_id;
							}else if (type_action == "effect") {
								$scope.theme.effect = 1;
								$scope.theme.effect_file.path = v.path;
								$scope.theme.effect_file.thumb = v.thumb;
								$scope.theme.effect_media_id = v.id;
							}
							else if (type_action == "theme_thumb") {
								$scope.theme.thumb_url = v.thumb;
								$scope.theme.thumb = v.id;
							}
		    			}else if($scope.support_key == "section"){
		    				$scope.section.style["background-image"] = 'url(' + v.path + ')';
		    			}
		    			return false;	
					});
					$scope.$apply();
		    	}	    	
		    	$scope.removeloaddPage();
		    },error : function(e){
		    	console.log(e);
		    	$scope.removeloaddPage();
				//window.location.href =  AppAccessCotroller + "themes/edit/"+$scope.theme.id;
		    }
		});
	}
	$scope.Uploads = function(_this){
		var formData = new FormData();  
		var length = $scope.part.metas.length;
		var max = parseInt($(_this).attr("data-max"));
		if(max - length < _this.files.length){
			alert("Vui lòng chọn tối đa " + (max - length) + " file");
			return false;
		}
		$.each(_this.files,function(k,v){
			formData.append('files[]', v, v.name);
		}) ;
		$scope.loaddPage();      
		$.ajax({
		    url  	 : AppAccess  + "filemanager/uploadflash/",
		    data 	 : formData,
		    type     : 'POST',
		    dataType : "json",
		    contentType  : false, 
		    processData  : false,  
		    success : function(e){
		    	if(e.status == "success"){
		    		$.each(e.response, function(k, v) {
		    			if($scope.support_key == "block"){
							v.media_id 			= v.id;
							v.id 				= 0;
							v.block_part_id    	= $scope.part.block_part_id;
							v.meta_key         	= "value_media";
							v.section_block_id 	= $scope.part.section_block_id;
							v.theme_section_id 	= $scope.part.theme_section_id;
							$scope.part.metas.push(v);
						}
					});
					$scope.$apply();
		    	}	    	
		    	$scope.removeloaddPage();
		    },error : function(e){
		    	console.log(e);
		    	$scope.removeloaddPage();
		    	window.location.href =  AppAccessCotroller + "/themes/edit/"+$scope.theme.id;
		    }
		});
	}
	$scope.save_part = function(){
		if($scope.support_key == "part"){
			$scope.loaddPage(); 
			try{
				if($("#modal-edit-part textarea[ng-model='meta.value']").length > 0){
					var content = $("#modal-edit-part textarea[ng-model='meta.value']").val();
					$scope.part.metas[0].value = content;
				}	
			}catch(e){

			}
			$http({
				method: "POST",
				responseType: "json",
				data: {
					actions          : $scope.part.actions,
					class_name       : $scope.part.class_name,
					ncolum           : $scope.part.ncolum,
					block_part_id    : $scope.part.block_part_id,
					section_block_id : $scope.part.section_block_id,
					theme_section_id : $scope.part.theme_section_id,
					metas            : $scope.part.metas,
					sort             : $scope.part.sort,
				},
				url  : AppAccessCotroller + "themes/save_part/",
			}).then(function(response) {
				$scope.removeloaddPage();
			}, function(error) {
				console.log(error);
				$scope.removeloaddPage();
			});
		}
	}
	$('#modal-edit-block').on('hidden.bs.modal', function () {
		$scope.support_key == "block";
		$scope.save_block();
		$scope.block.active = 0;
		$scope.support_key == "section";
	});
	$('#modal-review').on('show.bs.modal', function () {
		$scope.removeloaddPage();
	});
  	$('#modal-review').on('hidden.bs.modal', function () {
		$scope.review = 0;
		$scope.$apply();
	});
	$('#modal-edit-part').on('hidden.bs.modal', function () {
		$scope.save_part();
		$scope.support_key == "section";
	});
	$('#modal-edit-block').on('shown.bs.modal', function () {
		$scope.support_key == "block";
	});
	$('.modal').on('shown.bs.modal', function () {
		$.each($(this).find("input[sliderbootstrap]"),function(){
			$(this).sliderbootstrap("setValue",$(this).val());
		});
	});
	$scope.$watch("theme.effect_play",function(){
		if($scope.theme.effect_play != 1){
			try {
                $.fn.snow({
                    start: false
                });
            } catch (err) {}
		}
	});
	$scope.getposition = function (block){
		var string ="";
		$.each(block.parts,function(){
			if(this.name == "map"){
				var meta         = this.metas[0];
				var value        = meta.value;
				value = JSON.parse(value.replace(/\'/g, '"'));
				string =  [value.lat,value.lng];
				return false;
			}
		});
		return string;
	}
	$scope.SetZoom = function(map,blocks){
		var bounds = new google.maps.LatLngBounds();
		$.each(blocks,function(){
			$.each(this.parts,function(){
				if(this.name == "map"){
					var meta         = this.metas[0];
					var value        = meta.value;
					value = JSON.parse(value.replace(/\'/g, '"'));
					var latlng = new google.maps.LatLng(value.lat, value.lng);
	         		bounds.extend(latlng);
				}
			});
		});
		map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
        setTimeout(function() {
			google.maps.event.trigger(map, "resize");
		}, 500);
	}
}).filter('trustHtml', function($sce) {
	return function(html) {
		return $sce.trustAsHtml(html);
	}
});
App.directive('compile', ['$compile', function($compile) {
	return function(scope, element, attrs) {
		scope.$watch(
			function(scope) {
				return scope.$eval(attrs.compile);
			},
			function(value) {
				element.html(value);
				$compile(element.contents())(scope);
			}
		);
	};
}]);
App.directive('blocks', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'E',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			element.sortable({
				connectWith: "parent",
				handle: "#move-action",
				cursor: "move",
				revert: true,
				stop: function(event, ui) {
					var parent = ui.item.parent();
					var blocks = [];
					var sort = 0;
					var item = ui.item.scope();
					scope.blocks  = item.$parent.section.blocks;
					var sortlist = [];
					$.each(parent.find("block"), function(k, v) {
						var ramkey = $(this).attr("ramkey");
						$.each(scope.blocks, function(k, v) {
							if (ramkey == v.ramkey) {
								v.sort = sort;
								blocks.push(v);
								sortlist.push({
									section_block_id : v.section_block_id ,
									theme_section_id : v.theme_section_id
								});
								sort++;
							}
						});
					});
					scope.section = item.$parent.section;
					scope.blocks  = blocks;
					scope.section.blocks = blocks;
					scope.section.blocks = blocks;
					scope.UpdateSort("block",sortlist);
					scope.$apply();
				}
			});
			element.disableSelection();
		}
	};
});
App.directive('partmap', function() {
	return {
		restrict: 'A',
		template :'<ng-map zoom="8" map-initialized="initializedMap(map)" style="height:500px" center="{{block.position}}"><marker on-dragend="getCurrentLocation(marker)" draggable="true" position="{{block.position}}"></marker></ng-map>',
		replace: false,
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			scope.getCurrentLocation = function(marker){
				scope.part.metas[0].value = "{'lat' : "+marker.latLng.lat()+",'lng' : "+marker.latLng.lng()+"}";
				scope.block.position = [marker.latLng.lat(),marker.latLng.lng()];
				scope.$apply();
			}
			scope.initializedMap = function(map){
				scope.initializedMap = function(map){
					setTimeout(function() {
						google.maps.event.trigger(map, "resize");
					}, 1000);
				}
				element.prepend('<div class="form-group"><input type="text" name="class_name" class="form-control" id="search-places" value="" placeholder="Enter the place you want to find"></div>');
				var search  = element.find("#search-places")[0];
				var autocomplete = new google.maps.places.Autocomplete(search, {
					types: ['geocode']
				});
				autocomplete.bindTo('bounds',map);
				autocomplete.addListener('place_changed', function() {
					var place = this.getPlace();
					if (!place.geometry) {
						window.alert("No details available for input: '" + place.name + "'");
						return;
					}
					if (place.geometry.viewport) {
						scope.map.fitBounds(place.geometry.viewport);
					} else {
						scope.map.setCenter(place.geometry.location);
					}	
					scope.part.metas[0].value = JSON.stringify(place.geometry.location);	
					scope.block.position = [place.geometry.location.lat(),place.geometry.location.lng()];
					scope.$apply();
				});
				setTimeout(function() {
					google.maps.event.trigger(map, "resize");
				}, 500);
			}
			
		}
	};
});
App.directive('sectionsmenu', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			element.sortable({
				connectWith: "parent",
				cursor: "move",
				handle: "#move-action",
				revert: true,
				stop: function(event, ui) {
					var sections = [];
					var sortlist = [];
					scope.sections.order = true;
					angular.forEach(angular.element("#sections-setting ul[sectionsmenu] li"), function(value, key) {
						var ramkey = angular.element(value).attr("ramkey");
						var sort = 0;
						$.each(scope.sections, function(key, val) {
							if (val.ramkey == ramkey) {
								val.sort = sort;
								sections.push(val);
								sortlist.push({
									theme_section_id : val.theme_section_id
								});
								sort++;
							}
						});
					});
					scope.sections = sections;
					scope.UpdateSort("section",sortlist);
					$.each(scope.sections,function(){
						try{
							this.reload();
						}catch(e){}
					});
					scope.$apply();
				}
			});
			element.disableSelection();
		}
	};
});
App.directive('sortablemeta', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'C',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			element.sortable({
				connectWith: "parent",
				cursor: "move",
				handle:'.is_list',
				revert: true,
				placeholder: "ui-state-highlight",
				stop: function(event, ui) {					
					var parent   = ui.item.parent();
					var metas    = [];
					var item     = ui.item.scope();
					var sortlist = [];
					var sort     = 0;
					$.each(parent.find(">li"), function(k, v) {
						var ramkey = $(this).attr("ramkey");
						$.each(item.$parent.$parent.part.metas, function(k, v) {
							if (ramkey == v.ramkey) {
								v.sort = sort;
								metas.push(v);
								sortlist.push({
									meta_id          : v.id,
									section_block_id : v.section_block_id ,
									theme_section_id : v.theme_section_id
								});
								sort ++;
							}
						});					
					});
					item.$parent.$parent.part.metas = metas;
					scope.UpdateSort("meta",sortlist);
					try{
						scope.$apply();
					}catch(e){
						console.log(e)
					}
					
				}
			});
			element.disableSelection();
		}
	};
});
App.directive('blocksmenu', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			element.sortable({
				connectWith: "parent",
				cursor: "move",
				handle: "#move-action-new",
				revert: true,
				stop: function(event, ui) {
					scope.section.order = true;
					var parent = ui.item.parent();
					var blocks = [];
					var sort = 0;
					var item = ui.item.scope();
					var sortlist = [];
					$.each(element.find("> li"), function(k, v) {
						var ramkey = $(this).attr("ramkey");
						$.each(scope.blocks, function(k, v) {
							if (ramkey == v.ramkey) {
								v.sort = sort;
								blocks.push(v);
								sortlist.push({
									section_block_id : v.section_block_id ,
									theme_section_id : v.theme_section_id
								});
								sort++;
							}
						});
					});
					scope.blocks = blocks;
					scope.section.blocks = blocks;
					scope.UpdateSort("block",sortlist);
					scope.$apply();
				}
			});
			element.disableSelection();
		}
	};
});
App.directive('colorpicker', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			element.colorpicker({
				color: element.val(),
				defaultPalette: 'web',
				history: false,
				hideButton: true,
			});
		}
	};
});
App.directive('openfilemanager', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'AE',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			var beforchoose = function(val) {
				var type_action = element.attr("data-action");
				if (type_action == "background-image") {
					if (scope.support_key == "theme") {
						try{
							scope.theme.style["background-image"] = 'url(' + val[0].path + ')';
						}catch(e){
							scope.theme.style = {};
							scope.theme.style["background-image"] = 'url(' + val[0].path + ')';
						}
						
					} else if (scope.support_key == "section") {
						try{
							scope.section.style["background-image"] = 'url(' + val[0].path + ')';
						}catch(e){
							scope.section.style = {};
							scope.section.style["background-image"] = 'url(' + val[0].path + ')';
						}
						
					};
				}
				if (type_action == "sound") {
					var newsound = val[0];
					newsound.active = 1;
					newsound.start = 0;
					scope.theme.sound = newsound;
					scope.theme.sound_file = val[0].id;
				}
				if (type_action == "theme_thumb") {
					scope.theme.thumb_url = val[0].thumb;
					scope.theme.thumb = val[0].id;
				}
        if (type_action == "style_url") {
					scope.theme.style_url  = val[0].path + 'style.css';
					scope.theme.script_url = val[0].path + 'main.js';
					scope.theme.folder     = val[0].id;
				}
				if (type_action == "effect") {
					scope.theme.effect = 1;
					scope.theme.effect_file.thumb = val[0].thumb;
					scope.theme.effect_file.path  = val[0].path;
					scope.theme.effect_media_id   = val[0].id;
				}
				scope.$apply();
			}
			var before = function() {
				this.query.max_file = element.attr("data-max");
				this.query.type_file = element.attr("data-type");
				var ext_filter = element.attr("data-exe");
				if (ext_filter) {
					this.query.ext_filter = ext_filter;
				}
				var length_medias = $(".modal #content-list .info-item").length;
				if (length_medias >= this.query.max_file && this.query.max_file > 1) {
					alert("Vui lòng chọn tối đa " + this.query.max_file + " file");
					return false;
				}
				return true;
			}
			element.Scfilemanagers({
				base_url: AppAccess,
				before: before,
				beforchoose: beforchoose			
			});
		}
	};
});
App.directive('openmanageformeta', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			var beforchoose = function(val) {
				var _this = this;
				if (val != null) {
					$.each(val, function(k, v) {
						v.media_id = v.id;
						v.id = 0;
						v.block_part_id    = scope.part.block_part_id;
						v.meta_key         = "value_media";
						v.section_block_id = scope.part.section_block_id;
						v.theme_section_id = scope.part.theme_section_id;
						if(_this.query.max_file > 1){
							scope.part.metas.push(v);
						}else{
							v.id = scope.part.metas[0].id;
							scope.part.metas[0] = (v);
							return false;
						}
					});		
				}
				scope.$apply();
			}
			var before = function() {
				$("#modal-filemanager").on("hidden.bs.modal",function(){
			            if(scope.support_key == "block"){
			            	$("body").addClass("modal-open");
			            }
			        });
				var length_medias = (scope.metas.length);
				if(element.attr("data-max") > 1){
					this.query.max_file = parseInt(element.attr("data-max")) - length_medias;
				}else{
					this.query.max_file = 1;
				}
				this.query.type_file = element.attr("data-type");
				var ext_filter = element.attr("data-exe");
				if (ext_filter) {
					this.query.ext_filter = ext_filter;
				}
				if (length_medias >= this.query.max_file && this.query.max_file > 1) {
					alert("Vui lòng chọn tối đa " + this.query.max_file + " file");
					return false;
				}
				return true;
			}
			element.Scfilemanagers({
				base_url: AppAccess,
				before: before,
				beforchoose: beforchoose,
			});
		}
	};
});
App.directive('sliderbootstrap', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'AEC',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			var unit = element.attr("data-unit");
			setTimeout(function() {
				element.sliderbootstrap({
					formatter: function(value) {
						return value + unit;
					}
				});
			}, 100);
		}
	};
});
App.directive('datetime', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			console.log(scope._defaultday_);
			try {
				element.datetimepicker('destroy');
			} catch (e) {}
			setTimeout(function() {
				element.datetimepicker({
					format: 'd/m/Y H:i',
					formatDate: 'd/m/Y H:i',
					minDate : scope._defaultday_
				});
			}, 20);
		}
	}
});
App.directive('day', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			try {
				element.datetimepicker('destroy');
			} catch (e) {}
			setTimeout(function() {
				element.datetimepicker({
					timepicker: false,
					format: 'd/m/Y',
					formatDate: 'd/m/Y',
				});
			}, 20);
		}
	}
});
App.directive('month', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			try {
				element.datetimepicker('destroy');
			} catch (e) {}
			setTimeout(function() {
				element.datetimepicker({
					timepicker: false,
					format: 'm',
					formatDate: 'm',
					viewMode: "months"
				});
			}, 20);
		}
	}
});
App.directive('year', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		template :'<option ng-repeat="year in years" value="{{year}}">{{year}}</option>',
		//The link function is responsible for registering DOM listeners as well as dating the DOM.
	}
});
App.directive('hours', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			try {
				element.datetimepicker('destroy');
			} catch (e) {}
			setTimeout(function() {
				element.datetimepicker({
					datepicker: false,
					format: 'H:i',
					formatDate: 'H:i'
				});
			}, 20);
		}
	}
});
App.directive('mapsorganizing',['$compile', function($compile) {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'E',
		template :'<ng-map style="height:600px" map-initialized="SetZoom(map,section.blocks_off)"><marker position="{{block.position}}" ng-repeat="block in section.blocks_off"></marker></ng-map>',
		link : function(scope, element, attrs){
			 
		}
	}
}]);
App.directive('defaultblock',['$compile', function($compile) {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'E',
		replace: false,
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {	
			scope.section.defaultblock = function(){
				if(this.layout_show_block != null){
					element.html('<'+this.layout_show_block+' section="section"></'+this.layout_show_block+'>');
					$compile(element.contents())(scope);
				}else{
					element.html('<auto section="section"></auto>');
					$compile(element.contents())(scope);
				}
				return this;
			}
			if(scope.section.class_name == "section-organizing-points"){
				$.each(scope.section.blocks_off,function(){
					this.position = scope.getposition(this);
				})
				element.parents(".wrapper-section").append('<div class="box-add"><mapsorganizing section="section"></mapsorganizing></div>');
				$compile(element.parents(".wrapper-section").find(".box-add").contents())(scope);
			}	
			scope.section.defaultblock();
			
		}
	}
}]);
App.directive('grid',['$compile', function($compile) {
	return {
		restrict : 'E',
		template : '<div class="default-blocks">\
						<block ng-if="(($index + 1) <= section.ncolum_show_block) || (($index + 1) <= section.more)" ng-class="[{true :\'not-edit\'}[block.actions.length == 0],{true : \'active\'}[block.active == 1]]" ng-repeat="block in section.blocks_off" class="col-md-{{12/section.ncolum_block}} block-item {{block.class_name}}" ramkey={{block.ramkey}} ng-attr-data-index="{{$index}}" data-index>\
					        <div class="wrapper-block">\
					          <div ng-if="mode == 0" class="menu-action" id="support_block">\
					            <ul class="menu-block" compile="ActionBlock(section)">\
					            </ul>\
					          </div>\
					          <parts class="list-parts">\
					            <div class="row">\
					              <part ng-if="part.metas.length > 0" ng-repeat="part in block.parts" class="col-md-{{part.ncolum}} {{part.name}} {{part.name}} part-item {{part.class_name}}" ramkey={{part.ramkey}} ng-attr-data-index="{{$index}}" data-index>\
					                <metadatas class="{{part.name}}" data-is="{{part.name}}">\
					                  <metadata ng-click="abc(part)" ng-attr-data-value="{{(part.metas[0].meta_key != \'value_media\') ? part.metas[0].value : part.metas[0].thumb}}" data-value="" class="{{part.metas[0].meta_key}}" compile="MetaShow(false)" ng-attr-data-index="0" data-index></metadata>\
					                </metadatas>\
					              </part>\
					            </div>\
					          </parts>\
					        </div>\
				      </block>\
				    </div>',
		link: function(scope, element, attrs) {
			scope.section.reload = function(){
				element.addClass("loading");
				element.parent().css("min-height", element.outerHeight() +"px");
				var index = 1;
				$.each(element.find("block"),function(key,value){
					if(index % scope.section.ncolum_block == 0 ){
						$(this).after('<div class="row break-clolums"><div/>');
					}
					index++;
				});
				element.removeClass("loading");
				element.parent().css("min-height","auto");	
				return this;
			}
			setTimeout(function(){
				scope.section.reload();		
			}, 500);
		}
	}
}]);
App.directive('slider',['$compile', function($compile) {
	return {
		restrict : 'E',
		template : '<div class="default-blocks"><block ng-if="(($index + 1) <= section.ncolum_show_block) || (($index + 1) <= section.more)" ng-class="[{true :\'not-edit\'}[block.actions.length == 0],{true : \'active\'}[block.active == 1]]" ng-repeat="block in section.blocks_off" class="col-md-{{12/section.ncolum_block}} block-item {{block.class_name}}" ramkey={{block.ramkey}} ng-attr-data-index="{{$index}}" data-index>\
				<div class="wrapper-block">\
					<div ng-if="mode == 0" class="menu-action" id="support_block">\
					<ul class="menu-block" compile="ActionBlock(section)">\
					</ul>\
					</div>\
					<parts class="list-parts">\
					<div class="row">\
						<part ng-if="part.metas.length > 0" ng-repeat="part in block.parts" class="col-md-{{part.ncolum}} {{part.name}} {{part.name}} part-item {{part.class_name}}" ramkey={{part.ramkey}} ng-attr-data-index="{{$index}}" data-index>\
						<metadatas class="{{part.name}}" data-is="{{part.name}}">\
							<metadata ng-attr-data-value="{{(part.metas[0].meta_key != \'value_media\') ? part.metas[0].value : part.metas[0].thumb}}" data-value="" class="{{part.metas[0].meta_key}}" compile="MetaShow()" ng-attr-data-index="0" data-index></metadata>\
						</metadatas>\
						</part>\
					</div>\
					</parts>\
				</div>\
			</block>\
		</div>',
		link: function(scope, element, attrs) {
			scope.section.reload = function(){
				try {
					element.find(".default-blocks").destroySlider();
				}catch(e){}
				var window_W = $("html").outerWidth();
				var window_H = $("html").outerHeight();
				var pager;
				var controls ;
				var item         = this.ncolum_block;
				var w            = element.find(".default-blocks").outerWidth();
				var lenght_item  = element.find(".default-blocks block").length;
				item = parseInt(item);
				if(lenght_item > item)  item;
				else item = lenght_item;
				if(window_W < 1025) {
					pager = true ; 
					controls = false;
					item = 3;
				}
				else {
					pager = false;
					controls = true;
				}
				if(window_W < 769) {
					item = 2;
				}
				if(window_W < 421) {
					item = 1;
					pager = false;
					controls = true;
				}				
				var slider = element.find(".default-blocks").bxSlider({
					minSlides  : item,
					maxSlides  : item,
					slideWidth : w/item,
					pager      : pager,
					controls   : controls,
					auto       : false,
					infiniteLoop: false,
					autoStart: false,
					slideMargin : 15,
					onSliderLoad : function(){
						element.css("max-height", element.outerHeight() +"px");
						element.parent().css("min-height", element.outerHeight() +"px");
						setTimeout(function() {
							element.removeClass("loading");
							element.parent().css("min-height","auto");
						},200);
						setTimeout(function() {
							$(window).trigger("resize");
						},500);
					}

				});
				return this;
			}	
			var time = scope.section.onload == 0 ? 1000 : 0;
			element.addClass("loading");
			setTimeout(function(){
				scope.section.reload();
				scope.section.onload = 1;
			}, time);
		}
	}
}]);
App.directive('auto',['$compile', function($compile) {
	return {
		restrict : 'E',
		template : '<div class="default-blocks">\
						<block ng-if="(($index + 1) <= section.ncolum_show_block) || (($index + 1) <= section.more)" ng-class="[{true :\'not-edit\'}[block.actions.length == 0],{true : \'active\'}[block.active == 1]]" ng-repeat="block in section.blocks_off" class="col-md-{{12/section.ncolum_block}} block-item {{block.class_name}}" ramkey={{block.ramkey}} ng-attr-data-index="{{$index}}" data-index>\
				        <div class="wrapper-block">\
				          <div ng-if="mode == 0" class="menu-action" id="support_block">\
				            <ul class="menu-block" compile="ActionBlock(section)">\
				            </ul>\
				          </div>\
				          <parts class="list-parts">\
				            <div class="row">\
				              <part ng-if="part.metas.length > 0" ng-repeat="part in block.parts" class="col-md-{{part.ncolum}} {{part.name}} {{part.name}} part-item {{part.class_name}}" ramkey={{part.ramkey}} ng-attr-data-index="{{$index}}" data-index>\
				                <metadatas class="{{part.name}}" data-is="{{part.name}}">\
				                  <metadata ng-attr-data-value="{{(part.metas[0].meta_key != \'value_media\') ? part.metas[0].value : part.metas[0].thumb}}" data-value="" class="{{part.metas[0].meta_key}}" compile="MetaShow()" ng-attr-data-index="0" data-index></metadata>\
				                </metadatas>\
				              </part>\
				            </div>\
				          </parts>\
				        </div>\
				      </block></div>',
		link: function(scope, element, attrs) {
			element.addClass("loading");
			scope.section.reload = function(){
				setTimeout(function() {
					element.removeClass("loading");
				},500)
				return this;
			}
			setTimeout(function() {
				scope.section.reload();
			},500)
		}
	}
}]);
App.directive('section',['$compile', function($compile) {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'E',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			setTimeout(function() {
				if(element.hasClass("section-count-down")){
					this.index = parseInt(element.attr("data-index"));
					this.section = scope.sections[this.index];
					var time = element.find(".block-count-down metadatas metadata").attr("data-value");
					var datimeElement = element.find(".block-count-down metadatas metadata");
					var b_key = parseInt(datimeElement.closest("block").attr("data-index"));
					var p_key = parseInt(datimeElement.closest("part").attr("data-index"));
					var m_key = parseInt(datimeElement.attr("data-index"));
					try{
						try{
							element.find("#content-section .wrapper-section .block-count-down .wrapper-block #countdown").countdown('destroy');
						}catch(e){}
						this.section.blocks[b_key].parts[p_key].metas[m_key].reload = function(){
							time = element.find(".block-count-down metadatas metadata").attr("data-value");
							var t = time.toDate("dd/mm/yyyy hh:ii");
							var datetime = new Date(t);
							element.find("#content-section .wrapper-section .block-count-down .wrapper-block #countdown").countdown(datetime, function(event) {
								var month = event.strftime('%-m');
								var year = event.strftime('%-y');
								var string = "";
								if(parseInt(year) > 0) string += event.strftime('<div class="item"><span class="number">%-y</span><span class="text">Năm</span></div>');
								if(parseInt(month) > 0)
									string += event.strftime('<div class="item"><span class="number">%-m</span><span class="text">Tháng</span></div>');
							    string += event.strftime(''
								    + '<div class="item"><span class="number">%-n</span> <span class="text">Ngày</span></div>'
								    + '<div class="item"><span class="number">%H</span> <span class="text">Giờ</span></div>'
								    + '<div class="item"><span class="number">%M</span> <span class="text">Phút</span></div>'
								    + '<div class="item"><span class="number">%S</span> <span class="text">Giây</span></div>'
							    ); 
							    var $this = $(this).html(string); 
							});
						}
					}catch(e){}
					var html = '<div ng-if="mode > 0" id ="countdown"></div>';
					var t = time.toDate("dd/mm/yyyy hh:ii");
					var datetime = new Date(t);
					element.find("#content-section .wrapper-section .block-count-down .wrapper-block").append(html);
					element.find("#content-section .wrapper-section .block-count-down .wrapper-block #countdown").countdown(datetime, function(event) {
						var month = event.strftime('%-m');
						var year = event.strftime('%-y');
						var string = "";
						if(parseInt(year) > 0) string += event.strftime('<div class="item"><span class="number">%-y</span><span class="text">Năm</span></div>');
						if(parseInt(month) > 0)
							string += event.strftime('<div class="item"><span class="number">%m</span><span class="text">Tháng</span></div>');
						    string += event.strftime(''
							    + '<div class="item"><span class="number">%-n</span> <span class="text">Ngày</span></div>'
							    + '<div class="item"><span class="number">%H</span> <span class="text">Giờ</span></div>'
							    + '<div class="item"><span class="number">%M</span> <span class="text">Phút</span></div>'
							    + '<div class="item"><span class="number">%S</span> <span class="text">Giây</span></div>'
						    ); 
					    var $this = $(this).html(string); 
					});
				}	
				
			}, 20);
		}
	}
}]);
App.directive('uploads', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			element.click(function(){
				var type = element.attr("data-type");
				var max = element.attr("data-max");
				var action = element.attr("data-action");
				var current = null;
				if(parseInt(max) > 1){
					current = scope.uploads;
				}else{
					current = scope.upload;
				}
				current.attr("accept",type+"/*");
				current.attr("data-max",max);
				current.attr("data-action",action);
				current.trigger("click");
				var index = element.parents("data-index");
			});
		}
	}
});
App.directive('parts', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'E',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			element.find("> div").sortable({
				connectWith: "parent",
				handle: "#move-action-part",
				cursor: "move",
				revert: true,
				stop: function(event, ui) {
					var parent = ui.item.parent();
					var parts = [];
					var sort = 0;
					var item = ui.item.scope();
					scope.parts = item.$parent.block.parts;
					var sortlist = [];
					$.each(parent.find("part"), function(k, v) {
						var ramkey = $(this).attr("ramkey");
						$.each(scope.parts, function(k, v) {
							if (ramkey == v.ramkey) {
								v.sort = sort;
								parts.push(v);
								sortlist.push({
									block_part_id    : v.block_part_id,
									section_block_id : v.section_block_id ,
									theme_section_id : v.theme_section_id
								});
								sort++;
							}
						});
					});
					scope.parts = parts;
					scope.block.parts = parts;
					scope.UpdateSort("part",sortlist);
					scope.$apply();
				}
			});
			element.disableSelection();
		}
	};
});
App.directive('metadata',['$window', function($window) {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		tempale : '',
		restrict: 'E',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
		    angular.element($window).bind('resize', function(){
		    	if($window.innerWidth > 768){
		    	    scope.scaleWidth = scope.defaultContent/$window.innerWidth;
		            $.each(element.find("span"),function(){
		           		var f = ($(this).css("font-size"));
		           		f = f.replace("px");
		           		f = parseInt(f);
		           		if(f >= 40){
		           			f = f/scope.scaleWidth;
		           			$(this).css("font-size",f +"px");
		           		}
		            });
		    	}
	        }); 
		}
	}
}]);
function tinymce_updateCharCounter(el, len) {
    $('#' + el.id).prev().find('.char_count').text(len + '/' + el.settings.max_chars);
}
function tinymce_getContentLength() {
    return tinymce.get(tinymce.activeEditor.id).contentDocument.body.innerText.length;
}
function CustomCleanup(type, content) {
  switch (type) {
   // gets passed when user submits the form
   case "get_from_editor":
    content = content.replace(/<p>\s*<\/p>/gi, ""); // remove empty paragraphs <-- does not work
    content = content.replace(/(http(s)?:\/\/(192.168.0.104|192.168.0.103))/gi, ''); //fix internal links

    break;
   // gets passed when new content is inserted into the editor
   case "insert_to_editor":
    content = content.replace(/“|„|”|«|»/gi, '"'); //replace Word quotes with standard ASCII quotes

    break;
  }
return content;
}
App.directive('editor', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'A',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			var _this = this;
			try{
				$("#" + element.attr("id")).tinymce().remove();
			}catch(e){
				
			}
			setTimeout(function() {
				_this.maxchar    = parseInt(element.attr("data-length"));
				_this.current    = $("#" + element.attr("id") );
				_this.idCurrent  = "#"+element.attr("id");
				_this.oldContent = _this.current.val();
				_this.css = "";
				_this.height  = 250;
				_this.height  = _this.maxchar == 100 ? 70 : 250;
				_this.editor  = tinymce.init({
					selector  : _this.idCurrent,
					max_chars : _this.maxchar, 
					setup: function (ed) {
				        var allowedKeys = [20,16,17,9,8, 37, 38, 39, 40, 46];  // backspace, delete and cursor keys
				        ed.on('KeyDown', function (e) {
				        	if (allowedKeys.indexOf(e.keyCode) == -1){
					        	if((tinymce_getContentLength() ) > this.settings.max_chars - 1){
					        		e.stopPropagation();
					        		e.preventDefault();
					        		return false;
					        	}
					        }
					        $("#"+this.id).val( tinyMCE.activeEditor.getContent() );
				            $("#"+this.id).trigger("change");
				            _this.oldContent = tinyMCE.activeEditor.getContent();	
				        	tinymce_updateCharCounter(this, tinymce_getContentLength());      
				        });
				        ed.on('KeyUp', function (e) {
				        	$("#"+this.id).val( tinyMCE.activeEditor.getContent() );
				            $("#"+this.id).trigger("change");	
				            _this.oldContent = tinyMCE.activeEditor.getContent();
				        	tinymce_updateCharCounter(this, tinymce_getContentLength());
				        });
				        ed.on('change', function (e) {
				        	$("#"+this.id).val( tinyMCE.activeEditor.getContent() );
				            $("#"+this.id).trigger("change");
				            _this.oldContent = tinyMCE.activeEditor.getContent();	
				            tinymce_updateCharCounter(this, tinymce_getContentLength());
				        });
				        ed.on('Undo', function (e) {
				        	$("#"+this.id).val( tinyMCE.activeEditor.getContent() );
				            $("#"+this.id).trigger("change");
				            _this.oldContent = tinyMCE.activeEditor.getContent();	
				            tinymce_updateCharCounter(this, tinymce_getContentLength());
					    });
					    ed.on('Redo', function (e) {
				        	$("#"+this.id).val( tinyMCE.activeEditor.getContent() );
				            $("#"+this.id).trigger("change");
				            _this.oldContent = tinyMCE.activeEditor.getContent();	
				            tinymce_updateCharCounter(this, tinymce_getContentLength());
					    });
					    ed.on('Paste', function (e) {
					    	var _thisNote = this;
					    	_this.oldContent = tinyMCE.activeEditor.getContent();
					    	setTimeout(function(){
					    		if((tinymce_getContentLength() ) > _thisNote.settings.max_chars){
					        		tinyMCE.activeEditor.undoManager.undo(); 
					                alert ("Vui lòng nhập nhiều nhất " +_thisNote.settings.max_chars+ " kí tự" );
					        	}
					    	},300);
					    });
				    },
				    init_instance_callback: function () { // initialize counter div
				        $('#' + this.id).prev().append('<div class="char_count" style="text-align:right"></div>');
				        tinymce_updateCharCounter(this, tinymce_getContentLength());
				    },
					menubar: false,
					content_css : scope.theme.style_url +',' + AppAccessSkin + '/skins/css/editor-style.css' ,
					content_style: _this.css,
					plugins: [
						'textcolor',
						'code',
						'colorpicker',
						'lineheight',
						'advlist autolink lists link image charmap print preview anchor ',
					],   
					contextmenu : false , 
					toolbar: 'fontsizeselect fontselect | bold italic | lineheightselect | forecolor alignleft aligncenter alignright alignjustify | link | code',
					font_formats: _ScriptThemeCongif_.setting_fonts + _ScriptThemeCongif_.fonts,
					fontsize_formats : scope.font_size.trim(),
					lineheight_formats: "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 34pt 36pt",
					mode : "exact",
					height: _this.height,
					cleanup_callback : CustomCleanup
				});
			}, 100);
		}
	}
});
App.directive('effictelent', function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'E',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			var thumb = scope.theme.effect_file.thumb ? scope.theme.effect_file.thumb : "http://weddingguu.xyz/uploads/source/imgeffect/start-59eef88a17c0f.png";
			var minSize = scope.theme.effect_file.minsize ? scope.theme.effect_file.minsize : 10;
			var maxSize = scope.theme.effect_file.maxsize ? scope.theme.effect_file.maxsize : 40;
			var newOn = scope.theme.effect_file.onnew ? scope.theme.effect_file.onnew : 800;
			$.fn.snow({
				element : element,
                minSize : parseInt(minSize),
                maxSize : parseInt(maxSize),
                newOn   : parseInt(newOn),
                flakeColor : '#fff',
                html: '<img src="'+thumb+'">'
            });
		}
	}
});
App.directive("p", function() {
	return {
		// A = attribute, E = Element, C = Class and M = HTML Comment
		restrict: 'E',
		//The link function is responsible for registering DOM listeners as well as updating the DOM.
		link: function(scope, element, attrs) {
			if(element.text() == null || element.text().trim() == "") element.remove();
		}
	}
});
String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
}
String.prototype.toDate = function(format){
  var normalized      = this.replace(/[^a-zA-Z0-9]/g, '-');
  var normalizedFormat= format.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  var formatItems     = normalizedFormat.split('-');
  var dateItems       = normalized.split('-');
  var monthIndex      = formatItems.indexOf("mm");
  var dayIndex        = formatItems.indexOf("dd");
  var yearIndex       = formatItems.indexOf("yyyy");
  var hourIndex       = formatItems.indexOf("hh");
  var minutesIndex    = formatItems.indexOf("ii");
  var secondsIndex    = formatItems.indexOf("ss");
  var today = new Date();
  var year  = yearIndex>-1  ? dateItems[yearIndex]    : today.getFullYear();
  var month = monthIndex>-1 ? dateItems[monthIndex]-1 : today.getMonth()-1;
  var day   = dayIndex>-1   ? dateItems[dayIndex]     : today.getDate();
  var hour    = hourIndex>-1      ? dateItems[hourIndex]    : today.getHours();
  var minute  = minutesIndex>-1   ? dateItems[minutesIndex] : today.getMinutes();
  var second  = secondsIndex>-1   ? dateItems[secondsIndex] : today.getSeconds();
  return new Date(year,month,day,hour,minute,second);
};