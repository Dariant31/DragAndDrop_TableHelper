function TableHelper(args){
	/* ----- Private Data holder ----- */
	var tablePlaceHolder	= $('#'+args.tableId);
	var Internaldata		= args.data;

	/* ----- Public Data Holder ----- */
	this.dragId 			= 0;
	this.dropId 			= 0;
	this.col 				= args.col;

	this.init = function(){
		this.drawTable();
		this.initListener();
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

		tablePlaceHolder.append(table);
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

		        alert("item with id : " + tableHelper.dragId + " has been dropped to item with id : " + tableHelper.dropId);
		      }
		    });
		})
	}

	this.init();

	return this;
}

