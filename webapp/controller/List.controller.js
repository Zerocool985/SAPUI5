sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/core/util/MockServer',
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/FilterType"
	//	'sap/ui/export/Spreadsheet'
	], function(jQuery, Controller, JSONModel, Filter, FilterOperator, FilterType) {
	"use strict";

	return Controller.extend("sap.ui.bookedTimes.wt.controller.List", {

		onInit : function () {

			//test ODATA Model
			//var oModel = this.getOwnerComponent().getModel("zCatsOdata");
			//var oView1 = oModel.getProperty("/ZCATS_TEST('000002919233')/workdate");
			//var oView1 = oModel.getProperty("/ZCATS_TEST('000002919233')/workdate");
			//console.log(oView1);

			//Get Model
			var jModel = this.getOwnerComponent().getModel("zCatsTestJ");
			var that = this;

			//after Model is loaded transform Date
			jModel.attachRequestCompleted(function() {
				//var oViewModel= new JSONModel(jModel);
				for (var i = 0; i< jModel.oData.d.results.length; i++){
					var sJsonDate = jModel.getProperty("/d/results/" + [i] + "/workdate");
					//Json Date in Datumsformat umwandeln
					var sNumber = sJsonDate.replace(/[^0-9]+/g,'');
					var iNumber = sNumber * 1; //trick seventeen
					var oDate = new Date(iNumber);
					jModel.setProperty("/d/results/"  + [i] + "/workdate", oDate);
				}
				//update the model with new Date format 
				that.getView().setModel(jModel, "view");
			});
		},
		
		
		onReset: function(oEvent) {
			//jQuery.sap.require("sap.m.MessageToast");
			// var params = oEvent.getParameters();
			var sMessage = "onReset trigered";
			sap.m.MessageToast.show(sMessage);
		},
		onSearch: function(oEvent) {
			//jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show("onSearch");
			var sMessage = "onSearch trigered";
			//var jModel = this.getOwnerComponent().getModel("zCatsTestJ");
			//console.log(jModel);


			/*
			var query = oEvent.getParameter("query");
			var list = this.getView().byId("list");
			var binding = list.getBinding("items");
			if( !query ) {
			    binding.filter( [] );
			} 
			else {
			   binding.filter( [ new sap.ui.model.Filter([
			      new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, query ),
			      new sap.ui.model.Filter("gender", sap.ui.model.FilterOperator.Contains, query )
			   ],false)
			])}
			*/
			
			// build filter array
			var aFilter = [];
			var oParams = oEvent.getParameter("selectionSet");
			var sIaNr = oParams[0].getValue();
			//var dStart = oParams[1].getValue();
			//var dEnd = oParams[2].getValue();
			console.log(sIaNr);
			var oList = this.getView().byId("exportTable");
			var oBinding = oList.getBinding("items");
			//console.log(oBinding);
			
			//console.log(this.getView().byId("raufnr"));
			//console.log(dEnd);
			if (sIaNr) {
				aFilter.push(new Filter("raufnr", FilterOperator.EQ, sIaNr));
			}
			//filter binding
				
			oBinding.filter(aFilter, FilterType.Application);
			//console.log(this.getView().byId("tRaufnr"));
			console.log(oBinding);

				
			//console.log(oList.getMetadata());
			
			
			
			//var exportTable = this.getView().byId("exportTable");
			//exportTable.setVisible(true);

		}

	});

});


/*

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/export/Spreadsheet"
], function(Controller, MockServer, Spreadsheet) {
	"use strict";

	return Controller.extend("sap.ui.export.sample.table.Spreadsheet", {

		onInit: function() {
			var oModel, oView;

			this._oMockServer = new MockServer({
				rootUri: "./localService/"
			});

			var sPath = jQuery.sap.getModulePath("sap.ui.export.sample.localService");
			this._oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");
			this._oMockServer.start();

			oModel = new sap.ui.model.odata.ODataModel("./localService", true);
			oModel.setCountSupported(false);

			oView = this.getView();
			oView.setModel(oModel);
		},

		createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				label: 'ID',
				type: 'number',
				property: 'UserID',
				scale: 0
			});

			aCols.push({
				property: 'Firstname',
				type: 'string'
			});

			aCols.push({
				property: 'Lastname',
				type: 'string'
			});

			aCols.push({
				label: 'Full name',
				property: ['Lastname', 'Firstname'],
				type: 'string',
				template: '{0}, {1}'
			});

			aCols.push({
				property: 'Birthdate',
				type: 'date'
			});

			aCols.push({
				property: 'Salary',
				type: 'number',
				scale: 2,
				delimiter: true
			});

			aCols.push({
				property: 'Currency',
				type: 'string'
			});

			aCols.push({
				property: 'Active',
				type: 'boolean',
				trueValue: 'YES',
				falseValue: 'NO'
			});

			return aCols;
		},

		onExport: function() {
			var aBoundProperties, aCols, oProperties, oRowBinding, oSettings, oTable, oController;

			oController = this;

			if (!this._oTable) {
				this._oTable = this.byId("exportTable");
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding("items");

			aCols = this.createColumnConfig();

			var oModel = oRowBinding.getModel();
			var oModelInterface = oModel.getInterface();

			oSettings = {
				workbook: { columns: aCols },
				dataSource: {
					type: "oData",
					dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
					serviceUrl: oModelInterface.sServiceUrl,
					headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
					count: oRowBinding.getLength ? oRowBinding.getLength() : null,
					useBatch: oModelInterface.bUseBatch,
					sizeLimit: oModelInterface.iSizeLimit
				},
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			new Spreadsheet(oSettings).build();
		},

		onExit: function() {
			this._oMockServer.stop();
		}
	});
});
*/