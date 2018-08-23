function TableHelper(args){
	/* ----- Private Data holder ----- */
	var tablePlaceHolder	= $('#'+args.tableId);
	var Internaldata		= args.data;
    var csrftoken           = args.csrftoken;

	/* ----- Public Data Holder ----- */
	this.dragId 			= 0;
	this.dropId 			= 0;
	this.col 				= args.col;
    this.url                = args.url;
    this.rawData            = args.rawData;
    this.pages              = 1;
    this.maxPages           = 0;
    this.state              = "new";
    this.limit              = args.limit;
    
	/* ----- Callback Holder ----- */
    this.dropCB             = args.dropCB;


	this.init = function(){

        if (this.url) {
            this.setData();
        } else {
            this.drawTable();
        }

	}

	this.drawTable = function(newData){
		if (newData) {
			Internaldata = newData
		}

		// make table element
		var table = $('<div>').addClass("table");
		
		// make table head
		var thead = $('<div>').attr("id", "tableHead");
		var singleData = Internaldata[0];

		col.forEach(function(item){
			var width = item["width"];
			var widthHtml = "";

			if (width) {
				widthHtml = 'style="flex-grow:0;width:'+width+'px";'
			}

			var theadItem = '<div class="tableHead_item" '+ widthHtml +'>';
				theadItem += item["title"];
				theadItem += '</div>';

			thead.append(theadItem);
		});

		table.append(thead);

		// make table body
		var tbody 	= $('<div>').attr("id", "tableBody");
		var mainCol = this.getMainCol();

		Internaldata.forEach(function (item){
			var tbodyItem  = '<div class ="tableBody_row">';
				tbodyItem += '<div class="dragable" id="drag_'+ item[mainCol["field"]] +'">';
				tbodyItem += '<div class="dropable tableBody_row_intern" id="drop_'+ item[mainCol["field"]] +'">';

			col.forEach(function(ele){
				var eleId = ele["field"];
				var width = ele["width"];
				var widthHtml = "";

				if (width) {
					widthHtml = 'style="flex-grow:0;width:'+width+'px";'
				}

				tbodyItem += '<div class="tbody_col" '+ widthHtml +'>' + item[eleId] + '</div>';
			})

				tbodyItem += '</div>';
				tbodyItem += '</div>';
			tbodyItem += '</div>';

			tbody.append(tbodyItem);
		})

		table.append(tbody);

        // make table footer
        var tfoot   = $('<div>').attr("id", "tableFooter");

        if (rawData) {
            var count = rawData["Count"];

            var tfootItemWrapper = $('<div>').attr('id',"footerWraper");

            var tfootItem1 = '<div id="counter"> <span id="counter_item">'+count+'</span> Item(s) </div">';
            var tfootItem2 = '<div id="navigation">';
            tfootItem2 += '<button class ="tableNavButton" id="prevTable" disabled>'+ "Back" + '</button>';
            tfootItem2 += '<button class ="tableNavButton" id="nextTable">'+ "Next" + '</button>';
            tfootItem2 += '</div">';

            tfootItemWrapper.append(tfootItem1);
            tfootItemWrapper.append(tfootItem2);

        }

        tfoot.append(tfootItemWrapper);

        table.append(tfoot);

        // append table
		tablePlaceHolder.append(table);
                
        
		this.initListener();
	}

	this.getMainCol = function(){
		var mainCol;

		col.forEach(function(item){
			if (item.hasOwnProperty("main")) {
				mainCol = item;
			}
		})

		return mainCol;
	}

    this.setData = function (args) {
        if (args) {
            var newUrl = args.newUrl;
            var offset = args.offset;
            var update = args.update;
        }
        

        if (newUrl) {
            this.url = newUrl;
        } else {
            var baseUrl = (this.url).split("?")[0];
            this.url = baseUrl
        }

        if (this.limit) {
            this.url += "?limit=" + limit;
            if (offset) {
                this.url += "&offset=" + offset;
            }
        }

        if (update) {
            tableHelper.state = "update";
        }

        

        $.ajax({
		    method      : "GET",
		    url         : this.url,
            contentType : "application/json; charset=utf-8",
	        dataType    : "json",
            headers     : { 'X-NCP-CSRF': this.csrftoken },
		    success     : function(data) {
                tableHelper.maxPages = Math.floor(data["Count"] / data["Limit"]);
                tableHelper.rawData = data;

                if (tableHelper.state == "update") {
                    tableHelper.updateTable(data["Result"]);
                } else {
                    tableHelper.drawTable(data["Result"]);
                }
		    },
    	    error: function (result) {
                var data = result.responseJSON;
                ncpBase.alertBoxShowError (data.Error.Message) ;
		    }
	    });
    }

    this.updateTable = function (data) {
        if (data) {
            Internaldata = data;
        }
        
        var tbody 	= $("#tableBody");

        // clear eventListener
        $(".dragable").unbind();
        $(".dropable").unbind();

        // clear element     
        tbody.empty();

		var mainCol = this.getMainCol();

		Internaldata.forEach(function (item){
			var tbodyItem  = '<div class ="tableBody_row">';
				tbodyItem += '<div class="dragable" id="drag_'+ item[mainCol["field"]] +'">';
				tbodyItem += '<div class="dropable tableBody_row_intern" id="drop_'+ item[mainCol["field"]] +'">';

			col.forEach(function(ele){
				var eleId = ele["field"];
				var width = ele["width"];
				var widthHtml = "";

				if (width) {
					widthHtml = 'style="flex-grow:0;width:'+width+'px";'
				}

				tbodyItem += '<div class="tbody_col" '+ widthHtml +'>' + item[eleId] + '</div>';
			})

				tbodyItem += '</div>';
				tbodyItem += '</div>';
			tbodyItem += '</div>';

			tbody.append(tbodyItem);
		});

        // update Count
        $('#counter_item').empty();
        $('#counter_item').append(this.rawData["Count"]);

        this.initListener();
    }

	this.initListener = function(){
		$(".dragable").each(function(){
			var itemId = $(this).attr("id");
			$('#'+itemId).draggable({
				revert:true,
				start:function(){
					var idNr = $(this).attr("id");
					dragId = idNr.split("_")[1];
				},
			});
		});

		$(".dropable").each(function(){
			var itemId = $(this).attr("id");
			$( "#" + itemId).droppable({
		      drop: function( event, ui ) {
		        var id = $( this ).attr("id");
		        var idNr = id.split("_")[1];
		        dropId = idNr;

                if (dropCB && typeof(dropCB) === "function") {
                    dropCB();
                } else {
		            alert("item with id : " + tableHelper.dragId + " has been dropped to item with id : " + tableHelper.dropId);
                }

		      }
		    });
		})

        if (this.state != "update") {
            $("#nextTable").on("click", function(){
                tableHelper.pages ++;
                tableHelper.paginate();
            });

            $("#prevTable").on("click", function(){
                tableHelper.pages --;
                tableHelper.paginate();
            });
        }        
	}

    this.paginate = function () {
        if (this.pages != 0) {
            $("#prevTable").removeAttr("disabled");
        } else {
            $("#prevTable").attr("disabled", true);
        }

        var currUrl = this.url; 
        currUrl = currUrl.split("?")[0];

        var offset = this.pages * this.limit;

        this.setData({
            offset:offset,
            update:true
        });

    }

	this.init();

	return this;
}

