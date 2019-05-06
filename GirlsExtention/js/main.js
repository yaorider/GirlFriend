function modifyDOM() {
    //You can play with your DOM here or check URL against your regex
    console.log('Tab script:');
    return document.getElementById("__token").value;
}

$(function(){

	$("#gifttGirl").click(function(){
		$("#gifttGirl").hide();
		$("#myGirl").hide();
		$("#adrress").hide();
		alert("���΂炭���Ԃ�������܂��̂ł��̂܂܂ł��҂��������B\r\nOK�{�^���������Ă��������B");
		console.log("Popup DOM fully loaded and parsed");
		//We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
		chrome.tabs.executeScript({
		    code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
		}, (results) => {
		    //Here we have just the innerHTML and not DOM structure
		    console.log('Popup script:')
		    var token = results;
		    getGirls(token).done(function(girlsDataList) {
				girlsDataList.sort(
					function(a, b){
						a = a.rarityName.toString().toLowerCase();
						b = b.rarityName.toString().toLowerCase();
						if(a < b) {
							return -1;
						} else if(a > b){
							return 1;
						}
						return 0;
					}
				);
				var girlsData = {};
				girlsData.name = "�K�[���̖��O";
				girlsData.rarityName = "���A�x";
				girlsData.count = "����";
				girlsData.sphere = "����";
				girlsDataList.unshift(girlsData);
				
			    // BOM �̗p�Ӂi���������΍�j
			    var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

			    // CSV �f�[�^�̗p��
			    var csv_data = girlsDataList.map(
			    	function(l){
			    		var tmp = l.name + "," + l.rarityName + "," + l.sphere + "," + l.count;
			    		return tmp;
			    	}
		    	).join('\r\n');
			    var blob = new Blob([bom, csv_data], { type: 'text/csv' });
			    var url = (window.URL || window.webkitURL).createObjectURL(blob);
			    var a = document.getElementById('downloader');
			    a.download = '�M�t�g�K�[��.csv';
			    a.href = url;

				$("#gifttGirl").show();
				$("#myGirl").show();
				$("#adrress").show();
				alert("csv�_�E�����[�h���J�n����܂��B\r\nOK�{�^���������Ă��������B");

			    // �_�E�����[�h�����N���N���b�N����
			    $('#downloader')[0].click();
		    });
		});
	});

	$("#myGirl").click(function(){
		$("#gifttGirl").hide();
		$("#myGirl").hide();
		$("#adrress").hide();
		alert("���΂炭���Ԃ�������܂��̂ł��̂܂܂ł��҂��������B\r\nOK�{�^���������Ă��������B");

		//We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
		chrome.tabs.executeScript({
		    code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
		}, (results) => {

			var myGirls = [];
		    var token = results;

			myGirlCount().done(function(searchCount){
				var page = searchCount / 10;
				page = Math.floor(page);
				if (searchCount % 10 > 0) {
					page = page + 1;
				} 
				for (var i=1; i <= page; i++) {
					getMyGirl(i).done(function(searchList,token){
						$.each(searchList,function(i,data) {
							var myGirl = {};
							myGirl.cardName = data.cardName;
							myGirl.rarityName = data.rarityName;
							myGirl.sphereName = data.sphereName;
							if (data.limitbreakCount == 1) {
								myGirl.limitbreakCount = "���E�˔j"
							} else {
								myGirl.limitbreakCount = "���˔j"
							}
							myGirls.push(myGirl);
						});
					});
				}
				myGirls.sort(
					function(a, b){
						a = a.rarityName.toString().toLowerCase();
						b = b.rarityName.toString().toLowerCase();
						if(a < b) {
							return -1;
						} else if(a > b){
							return 1;
						}
						return 0;
					}
				);
				
				var myGirl = {};
				myGirl.cardName = "�K�[���̖��O";
				myGirl.rarityName = "���A�x";
				myGirl.sphereName = "����";
				myGirl.limitbreakCount = "���E�˔j"
				myGirls.unshift(myGirl);
				
			    // BOM �̗p�Ӂi���������΍�j
			    var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

			    // CSV �f�[�^�̗p��
			    var csv_data = myGirls.map(
			    	function(l){
			    		var tmp = l.cardName + "," + l.rarityName + "," + l.sphereName + "," + l.limitbreakCount;
			    		return tmp;
			    	}
		    	).join('\r\n');
			    var blob = new Blob([bom, csv_data], { type: 'text/csv' });
			    var url = (window.URL || window.webkitURL).createObjectURL(blob);
			    var a = document.getElementById('downloader');
			    a.download = '�����K�[��.csv';
			    a.href = url;
				
				$("#gifttGirl").show();
				$("#myGirl").show();
				$("#adrress").show();
				alert("csv�_�E�����[�h���J�n����܂��B\r\nOK�{�^���������Ă��������B");

			    $('#downloader')[0].click();

			});
		});
	});
});

function getMyGirl(page,token) {
	var defer = $.Deferred();
	$.ajax({
	  type: "GET",
	  url: "https://vcard.ameba.jp/card/ajax/card-list-search?userCardListType=GIRLS_PAGE&diffSpecified=true&sortType=DATETIME&sortDirection=DESC&page=" + page + "&exceptLeaderCard=true",
	  dataType: "json",
	  async: false
	}).done(function( data ) {
		defer.resolve(data.data.searchList);
	})
	.fail(function() {
		defer.reject();
	})
	.always(function() {
    });
	return defer.promise();
};


function myGirlCount() {
	var defer = $.Deferred();

	$.ajax({
	  type: "GET",
	  url: "https://vcard.ameba.jp/card/ajax/card-list-search?userCardListType=GIRLS_PAGE&diffSpecified=false&sortType=DATETIME&sortDirection=DESC&exceptLeaderCard=true&spheres=ALL&deckBonusIds=0",
	  dataType: "json",
	  async: false
	}).done(function( data ) {
		defer.resolve(data.data.searchCount);
	})
	.fail(function() {
		defer.reject();
	})
	.always(function() {
    });
	return defer.promise();
};


function getGirls(token) {
	var defer = $.Deferred();
	var girlsDataList = [];

	$.ajax({
	  type: "GET",
	  url: "https://vcard.ameba.jp/giftbox/gift-search?sort=0&page=1&other=0&sphere=0&rarity=0&selectedGift=1&token=" + token,
	  dataType: "json",
	  async: false
	}).done(function( data ) {
		token = data.token;
		var maxPage = data.data.maxPage;
		$.each(data.data.results,function(i,girls) {
			var girlsData = {};
			girlsData.name = girls.name;
			girlsData.rarityName = girls.rarityName;
			girlsData.count = 0;
			if (girls.sphereId === 1) {
				girlsData.sphere = "COOL";
			} else if (girls.sphereId === 2) {
				girlsData.sphere = "SWEET";
			} else if (girls.sphereId === 3) {
				girlsData.sphere = "POP";
			}
			checkDuplication(girlsDataList,girlsData).done(function (num) {
				if (num === -1) {
					girlsData.count = 1;
					girlsDataList.push(girlsData);
				} else {
					girlsDataList[num].count = girlsDataList[num].count + 1;
				}
			});
		});
		getGiftGirls(girlsDataList,maxPage,token);
		defer.resolve(girlsDataList);
	})
	.fail(function() {
		defer.reject();
	})
	.always(function() {
    });
	return defer.promise();
};

function getGiftGirls(girlsDataList, maxPage, token) {
	for (var i = 2; i < maxPage; i++) {
		$.ajax({
		  type: "GET",
		  url: "https://vcard.ameba.jp/giftbox/gift-search?sort=0&page=" + i + "&other=0&sphere=0&rarity=0&selectedGift=1&token=" + token,
		  dataType: "json",
		  async: false
		}).done(function( data ) {
			token = data.token;
			var maxPage = data.data.maxPage;
			$.each(data.data.results,function(i,girls) {
				var girlsData = {};
				girlsData.name = girls.name;
				girlsData.rarityName = girls.rarityName;
				girlsData.count = 0;
				if (girls.sphereId === 1) {
					girlsData.sphere = "COOL";
				} else if (girls.sphereId === 2) {
					girlsData.sphere = "SWEET";
				} else if (girls.sphereId === 3) {
					girlsData.sphere = "POP";
				}
				checkDuplication(girlsDataList,girlsData).done(function (num) {
					if (num === -1) {
						girlsData.count = 1;
						girlsDataList.push(girlsData);
					} else {
						girlsDataList[num].count = girlsDataList[num].count + 1;
					}
				});
			});
		})
		.fail(function() {
			console.log( "error" );
		})
		.always(function() {
			console.log( "complete" );
	    });
	}
}

function checkDuplication(girlsDataList, girlsData) {
	var defer = $.Deferred();
	$.each(girlsDataList, function(i, data) {
		if ((data.name === girlsData.name) &&
			(data.rarityName === girlsData.rarityName) &&
			(data.sphere === girlsData.sphere)) {
			defer.resolve(i);
			return defer.promise();
		}
	});
	defer.resolve(-1)
	return defer.promise();
}

