//ver 0.0.7
function CommentGenerator(Handle, Comment, hcgFormat, txtFormat)
{
	var TxtFormat = new Object();
	TxtFormat = txtFormat;
	var HcgFormat = new Object();
	HcgFormat = hcgFormat;
	//コテハン設定(リスナーが色やスキンを指定)
	this.handle = Handle;
	var PrivateColorPos = Handle.indexOf("{");
	var PrivateColor = "";
	//色指定
	if((TxtFormat['userBGColor']==1)&&(PrivateColorPos!=-1)) {
		if(Handle.substr(PrivateColorPos+1,1)=="#") {
			PrivateColor = Handle.substr(PrivateColorPos+2,6);
		} else {
			PrivateColor = Handle.substr(PrivateColorPos+1,6);
		}
		console.log(PrivateColor);
	}
	//スキン設定
	var PrivateSkinStart = Handle.indexOf("[");
	var PrivateSkinEnd = Handle.indexOf("]");
	var PrivateSkin = "";
	if((TxtFormat['userSkinName']==1)&&(PrivateSkinStart!=-1)&&(PrivateSkinEnd!=-1)) {
		if(PrivateSkinEnd-PrivateSkinStart-1!=0) {
			PrivateSkin = TxtFormat['SkinFolder']+"/skin_"+Handle.substr(PrivateSkinStart+1,PrivateSkinEnd-PrivateSkinStart-1)+".png";
		}
		console.log(PrivateSkin);
	}
	if((PrivateColor != "")&&(PrivateSkin != "")) {
		if(PrivateColorPos < PrivateSkinStart) {
			this.handle = Handle.substr(0,PrivateColorPos);
		} else {
			this.handle = Handle.substr(0,PrivateSkinStart);
		}
	} else if(PrivateColor != "") {
		this.handle = Handle.substr(0,PrivateColorPos);
	} else if(PrivateSkin != "") {
		this.handle = Handle.substr(0,PrivateSkinStart);
	}
	//コテハン設定
	if(TxtFormat['HandleOrder'] == 1) {
		this.handle = this.handle + TxtFormat['Honorific'];
	} else if(TxtFormat['HandleOrder'] == 2) {
		this.handle =  TxtFormat['Honorific'] + this.handle;
	}
	this.comment = Comment;
	//背景色初期設定
	var graphics = new createjs.Graphics();
	var BgColor = "";
	if(PrivateColor != "") {
		BgColor = PrivateColor;
	} else if(TxtFormat['BgColorType'] == 2) {
		BgColor = Math.floor(Math.random()*16777215).toString(16);
		BgColor = ("0"+BgColor).slice(-6); //桁合わせ
	} else {
		BgColor = TxtFormat['BgColor'];
	}
	var color = parseInt(BgColor, 16);
	var skinR = color >> 16 & 0xFF;
	var skinG = color >>  8 & 0xFF;
	var skinB = color & 0xFF;
	this.color_matrix = [
		1.0, 0.0, 0.0, 0.0, skinR/10*8,
		0.0, 1.0, 0.0, 0.0, skinG/10*8,
		0.0, 0.0, 1.0, 0.0, skinB/10*8,
		0.0, 0.0, 0.0, 1.0, 0.0
	];
	//背景設定
	graphics.beginFill("#"+BgColor);
	graphics.drawRect(0, 0, 510, HcgFormat['SkinHeight']);
	this.bgcolorbar = new createjs.Shape(graphics);
	this.bgcolorbar.y = HcgFormat['SkinHeight']*(HcgFormat['CommentMax']-1);
	if(TxtFormat['BgColorType'] == 0) {
		this.bgcolorbar.visible = false;
	}
	//スキン初期設定
	this.skinimage = new createjs.Bitmap();//空画像
	this.skinimage.y = HcgFormat['SkinHeight']*(HcgFormat['CommentMax']-1);
	if(TxtFormat['SkinType'] == 0) {
		this.skinimage.visible = false;
	} else if((TxtFormat['SkinType'] != 0)&&(PrivateSkin != "")) {
		this.skinloader = new createjs.ImageLoader(HcgFormat['PathHead']+PrivateSkin, false);
		this.skinloader.addEventListener("complete",(function(event) {
			this.skinimage.image = new createjs.Bitmap(event.result).image;
			//背景色が透明以外ならカラー調整を加える
			if((TxtFormat['SkinType'] != 0)&&(TxtFormat['BgColorType'] != 0)) {
				this.bgcolorbar.visible = false;
				this.skinimage.filters = [new createjs.ColorMatrixFilter(this.color_matrix)];
				this.skinimage.cache(0,0,512,HcgFormat['SkinHeight']);
			}
			console.log("リスナー指定Skin画像ファイル読み込み");
		}).bind(this),false);
		this.skinloader.load();
	} else if(TxtFormat['SkinType'] == 1) {
		//スキンファイル
		if(TxtFormat['SkinFile'] != "") {
			this.skinloader = new createjs.ImageLoader(HcgFormat['PathHead']+TxtFormat['SkinFile'], false);
			this.skinloader.addEventListener("complete",(function(event) {
				this.skinimage.image = new createjs.Bitmap(event.result).image;
				//背景色が透明以外ならカラー調整を加える
				if((TxtFormat['SkinType'] != 0)&&(TxtFormat['BgColorType'] != 0)) {
					this.bgcolorbar.visible = false;
					this.skinimage.filters = [new createjs.ColorMatrixFilter(this.color_matrix)];
					this.skinimage.cache(0,0,512,HcgFormat['SkinHeight']);
				}
				console.log("Skin画像ファイル読み込み");
			}).bind(this),false);
			this.skinloader.load();
		}
	} else if(TxtFormat['SkinType'] == 2) {
		//ランダムスキンが入ったフォルダ
		handleComplete = (function(event) {
			var loader = event.target;
			loader.removeEventListener("complete", handleComplete);
			var xml = loader.getResult("IDSkinsFile");
			if(xml.getElementsByTagName('skin').length > 0) {
				var filename = xml.getElementsByTagName('skin')[
				Math.floor(Math.random() * xml.getElementsByTagName('skin').length)
				].firstChild.nodeValue;
				console.log(filename);
				this.skinloader = new createjs.ImageLoader(HcgFormat['PathHead']+filename, false);
				this.skinloader.addEventListener("complete",(function(event) {
					this.skinimage.image = new createjs.Bitmap(event.result).image;
					//背景色が透明以外ならカラー調整を加える
					if((TxtFormat['SkinType'] != 0)&&(TxtFormat['BgColorType'] != 0)) {
						this.bgcolorbar.visible = false;
						this.skinimage.filters = [new createjs.ColorMatrixFilter(this.color_matrix)];
						this.skinimage.cache(0,0,512,HcgFormat['SkinHeight']);
					}
					console.log("Skin画像ファイル読み込み");
				}).bind(this),false);
				this.skinloader.load();
			}
			console.log("Skinsファイル読み込み");
		}).bind(this);
		if(TxtFormat['SkinFolder'] != "") {
			var queue = new createjs.LoadQueue(true);
			var manifest = [
		{"src":HcgFormat['CurrentPath']+"skins.xml","id":"IDSkinsFile"}
		 	];
			queue.loadManifest(manifest,true);
			queue.load();
			queue.addEventListener('complete',handleComplete);
		}
	}
	//余白
	this.upSpace = TxtFormat['TxtUpSpace'];
	this.leftSpace = TxtFormat['TxtLeftSpace'];
	//テキスト
	if(TxtFormat['HandleVisible'] == "1") {
		this.textcomment = new createjs.Text(this.handle+"「", TxtFormat['TxtSize']+"px "+TxtFormat['TxtFont'], "#"+TxtFormat['TxtColor']);
	} else {
		this.textcomment = new createjs.Text("「", TxtFormat['TxtSize']+"px "+TxtFormat['TxtFont'], "#"+TxtFormat['TxtColor']);
	}
	for (i=0; i<this.comment.length; i++) {
		this.textcomment.text = this.textcomment.text + this.comment.substring(i,i+1);
		if(Number(Number(this.textcomment.getMeasuredWidth())+Number(TxtFormat['TxtLeftSpace'])) > Number(TxtFormat['TxtLength'])) {
			//console.log(Number(Number(this.textcomment.getMeasuredWidth())+Number(TxtFormat['TxtLeftSpace'])));
			if(TxtFormat['TxtLengthValue'].trim() != "") {
				this.textcomment.text = 
				  this.textcomment.text.substr(0, (this.textcomment.text.length-TxtFormat['TxtLengthValue'].trim().length))
				 + TxtFormat['TxtLengthValue'].trim();
			}
			break;
		}
	}
	this.textcomment.text = this.textcomment.text + "」";
	this.textcomment.y = Number(TxtFormat['TxtUpSpace']) + HcgFormat['SkinHeight']*(HcgFormat['CommentMax']-1);
	this.textedgecomment = new createjs.Text(this.textcomment.text, TxtFormat['TxtSize']+"px "+TxtFormat['TxtFont'], "#"+TxtFormat['TxtEdgeColor']);
	this.textedgecomment.y = Number(TxtFormat['TxtUpSpace']) + HcgFormat['SkinHeight']*(HcgFormat['CommentMax']-1);
	this.textedgecomment.outline = true;
	this.textedgecomment.outline = Number(TxtFormat['TxtEdgeValue']);
	if(TxtFormat['TxtEdgeType'] == 0) {
		this.textedgecomment.visible = false;
	}
	
	this.animetype = 0;	//0:in 1:out
	if(TxtFormat['Direction'] == 0) {
		this.skinimage.x = 512;
		this.bgcolorbar.x = 512;
		this.textedgecomment.x = 512;
		this.textcomment.x = 512;
	} else {
		this.skinimage.x = -512;
		this.bgcolorbar.x = -512;
		this.textedgecomment.x = -512;
		this.textcomment.x = -512;
	}
	
	//コメント表示アニメーション
	CommentAnimation = (function() {
		if(TxtFormat['Direction'] == 0) {
			//右から左へ流れ　右に出る
			if(this.animetype == 0) {
				this.skinimage.x += ( 0 - this.skinimage.x ) * 0.1;
				this.bgcolorbar.x += ( 0 - this.bgcolorbar.x ) * 0.1;
				this.textedgecomment.x += ( this.leftSpace - this.textedgecomment.x ) * 0.1;
				this.textcomment.x += ( this.leftSpace - this.textcomment.x ) * 0.1;
			} else {
				this.skinimage.x += ( 512 - this.skinimage.x ) * 0.1;
				this.bgcolorbar.x += ( 512 - this.bgcolorbar.x ) * 0.1;
				this.textedgecomment.x += ( 512 - this.textedgecomment.x ) * 0.1;
				this.textcomment.x += ( 512 - this.textcomment.x ) * 0.1;
			}
		} else {
			//左から右へ流れ　左に出る
			if(this.animetype == 0) {
				this.skinimage.x += ( 0 - this.skinimage.x ) * 0.1;
				this.bgcolorbar.x += ( 0 - this.bgcolorbar.x ) * 0.1;
				this.textedgecomment.x += ( this.leftSpace - this.textedgecomment.x ) * 0.1;
				this.textcomment.x += ( this.leftSpace - this.textcomment.x ) * 0.1;
			} else {
				this.skinimage.x += ( -512 - this.skinimage.x ) * 0.1;
				this.bgcolorbar.x += ( -512 - this.bgcolorbar.x ) * 0.1;
				this.textedgecomment.x += ( -512 - this.textedgecomment.x ) * 0.1;
				this.textcomment.x += ( -512 - this.textcomment.x ) * 0.1;
			}
		}
	}).bind(this);
	
	//インアウトアニメーションの切り替え
	animeswitch = (function() {
		this.animetype = 1;
	}).bind(this);
	
	createjs.Ticker.addEventListener('tick', CommentAnimation);
	if(TxtFormat['TimeType'] != 1) {
		this.animetimer = setTimeout(animeswitch, (TxtFormat['TimeValue'])*1000);
	}
};
CommentGenerator.prototype.getSkinImage = function() {
	return this.skinimage;
};
CommentGenerator.prototype.getBGColorBar = function() {
	return this.bgcolorbar;
};
CommentGenerator.prototype.getCommentText = function() {
	return this.textcomment;
};
CommentGenerator.prototype.getEdgeCommentText = function() {
	return this.textedgecomment;
};