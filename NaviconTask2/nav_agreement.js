var Navicon = Navicon || {};

Navicon.nav_agreement = (function () {

    /**
     * Если изменилось значение полей Контакт или Автомобиль показать Кредитныую программу.
     * @param {*} context 
     */
    let onContactOrAutoChanged = function (context) {
        let formContext = context.getFormContext();

        let contactValue = formContext.getAttribute("nav_contact")
            .getValue();
        let autoIdValue = formContext.getAttribute("nav_autoid")
            .getValue();

        let creditIdControl = formContext.getControl("nav_creditid");

        if (!!creditIdControl) {
            if (!!contactValue && !!autoIdValue) {
                creditIdControl.setVisible(true);
            }
            else creditIdControl.setVisible(false);
        }
        else alert("try to get nav_creditid control, but get null");
    };

    /**
     * Если изменилось поле Кредитная программа показать поля связанные с кредитом.
     * @param {*} context 
     */
    let onCreditIdChanged = function (context) {
        let formContext = context.getFormContext();

        let creditIdValue = formContext.getAttribute("nav_creditid")
            .getValue();

        let summaControl = formContext.getControl("nav_summa");
        let factControl = formContext.getControl("nav_fact");
        let creditTab = formContext.ui.tabs.get("tab_2");

        if (!!summaControl && !!factControl && !!creditTab) {
            if (!!creditIdValue) {
                summaControl.setVisible(true);
                factControl.setVisible(true);
                creditTab.setVisible(true);
            }
            else {
                summaControl.setVisible(false);
                factControl.setVisible(false);
                creditTab.setVisible(false);
            }
        }
        else alert("try to get nav_summa and nav_fact controls, tab_2 but get null");
    };

    /**
     * Если поле Автомобиль показать в поле Кредитные программы только связанные объекты.
     * @param {*} context 
     */
    let onAutoChanged = function (context) {
        let formContext = context.getFormContext();
        let autoValue = formContext.getAttribute("nav_autoid")
            .getValue();

        if (!!autoValue) {

            autoId = autoValue[0].id;
            autoId = autoId.toLowerCase().substring(1, autoId.length - 1);
            console.log(autoId);

            Xrm.WebApi.retrieveMultipleRecords("nav_nav_credit_nav_auto", "?$select=nav_creditid&$filter=nav_autoid eq " + autoId).then(
                function success(result) {
                    let autoFilter = "<filter type='or'>";
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i]);
                        autoFilter += "<condition attribute='nav_creditid' operator='eq' value='" + result.entities[i].nav_creditid + "'/>";
                    }
                    autoFilter += "</filter>";

                    console.log(autoFilter);

                    var preSearchFunc = function () {
                        formContext.getControl("nav_creditid").addCustomFilter(autoFilter);
                    }

                    //formContext.getControl("nav_creditid").removePreSearch(preSearchFunc);
                    formContext.getControl("nav_creditid").addPreSearch(function () {
                        preSearchFunc();
                    });
                },
                function (error) {
                    console.log(error.message);
                }
            );
        }
    }

    let onNameChanged = function(context){
        let formContext = context.getFormContext();
        let nameAttr = formContext.getAttribute("nav_name");
        let nameValue=nameAttr.getValue();
        nameValue=nameValue.replace(/[^\d\-]/g, '');
        console.log(nameValue);

        nameAttr.setValue(nameValue);
    }

    return {

        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onLoad: function (context) {
            let formContext = context.getFormContext();

            if (!!formContext) {

                //#region Скрыто все кроме номер, дата договора, контакт и автомобиль.
                let disableControl = formContext.getControl("nav_summa");
                if (!!disableControl) {
                    disableControl.setVisible(false);
                }
                else alert("try to get nav_summa control, but get null");

                disableControl = formContext.getControl("nav_fact");
                if (!!disableControl) {
                    disableControl.setVisible(false);
                }
                else alert("try to get nav_fact control, but get null");

                disableControl = formContext.getControl("nav_creditid");
                if (!!disableControl) {
                    disableControl.setVisible(false);
                }
                else alert("try to get nav_creditid control, but get null");

                disableControl = formContext.ui.tabs.get("tab_2");
                if (!!disableControl) {
                    disableControl.setVisible(false);
                }
                else alert("try to get tab_2 control, but get null");
                //#endregion

                //#region Показать поле Кредитная программа, если поля Контакт и Автомобиль не пустые.
                let contactAttr = formContext.getAttribute("nav_contact");
                let autoIdAttr = formContext.getAttribute("nav_autoid");

                if (!!contactAttr && !!autoIdAttr) {
                    onContactOrAutoChanged(context);
                    contactAttr.addOnChange(onContactOrAutoChanged);
                    autoIdAttr.addOnChange(onContactOrAutoChanged);
                }
                else alert("try to get nav_contact and nav_autoid attr, but get null")
                //#endregion

                //#region Открыть поля связанные с кредитом, если поле Кредитная программа не пустое.

                let creditIdAttr = formContext.getAttribute("nav_creditid");

                if (!!creditIdAttr) {
                    onCreditIdChanged(context);
                    creditIdAttr.addOnChange(onCreditIdChanged);
                }
                else alert("try to get nav_creditid attr, but get null");

                //#endregion

                //#region Показывать в поиске Кредитные программы только связанные с Автомобилем

                if (!!autoIdAttr) {
                    autoIdAttr.addOnChange(onAutoChanged);
                }
                else alert("try to get nav_contact and nav_autoid attr, but get null");

                //#endregion

                let nameControl = formContext.getAttribute("nav_name");
                nameControl.addOnChange(onNameChanged);
            }
            else alert("try to get formContext control, but get null");
        }
    }
})();


